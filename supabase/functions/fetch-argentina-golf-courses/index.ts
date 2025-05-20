
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const requestData = await req.json();
    
    // Handle check parameter - just return success to verify the function exists
    if (requestData.check === true) {
      return new Response(
        JSON.stringify({ success: true, message: 'Function is accessible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get API key from environment variable or request body
    let GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    // If API key is provided in the request, use it instead
    if (requestData.apiKey) {
      GOOGLE_MAPS_API_KEY = requestData.apiKey;
    }
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      return new Response(JSON.stringify({ error: 'Google Maps API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get auth token to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract parameters from request
    const { region = 'argentina', pageToken } = requestData;
    
    console.log(`Fetching golf courses in ${region}${pageToken ? ' with page token' : ''}`);

    // Build the URL for the Places API request
    const placesApiUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    placesApiUrl.searchParams.append('query', `golf courses in ${region}`);
    placesApiUrl.searchParams.append('type', 'golf_course');
    placesApiUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    
    if (pageToken) {
      placesApiUrl.searchParams.append('pagetoken', pageToken);
    }

    // Fetch golf courses from Google Places API
    const response = await fetch(placesApiUrl.toString());
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data);
      return new Response(JSON.stringify({ error: `Google Places API error: ${data.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${data.results?.length || 0} golf courses`);
    
    // Process and insert golf courses into the database
    const processedCourses = [];
    const errors = [];
    
    for (const place of data.results || []) {
      try {
        // Fetch more details about the place to get opening hours
        const placeDetailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        placeDetailsUrl.searchParams.append('place_id', place.place_id);
        placeDetailsUrl.searchParams.append('fields', 'opening_hours,website,formatted_phone_number');
        placeDetailsUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
        
        const detailsResponse = await fetch(placeDetailsUrl.toString());
        const detailsData = await detailsResponse.json();
        const placeDetails = detailsData.result || {};
        
        // Format opening hours for our database
        let formattedOpeningHours = null;
        if (placeDetails.opening_hours?.periods) {
          formattedOpeningHours = Array(7).fill({ isOpen: false, open: null, close: null });
          
          placeDetails.opening_hours.periods.forEach((period: any) => {
            const dayOfWeek = period.open.day;
            if (period.open && period.close) {
              formattedOpeningHours[dayOfWeek] = {
                isOpen: true,
                open: `${period.open.time.slice(0, 2)}:${period.open.time.slice(2)}`,
                close: `${period.close.time.slice(0, 2)}:${period.close.time.slice(2)}`
              };
            }
          });
        }
        
        // Prepare the course data - focusing only on name, address, and opening hours
        const courseData = {
          name: place.name,
          address: place.formatted_address,
          opening_hours: formattedOpeningHours,
          holes: 18, // Default value
          par: 72, // Default value
          hole_pars: Array(18).fill(4), // Default value of par 4 for all holes
        };
        
        // Check if the course already exists
        const { data: existingCourse } = await supabase
          .from('golf_courses')
          .select('id')
          .eq('name', courseData.name)
          .maybeSingle();
        
        if (existingCourse) {
          // Update existing course
          const { error: updateError } = await supabase
            .from('golf_courses')
            .update({
              address: courseData.address,
              opening_hours: courseData.opening_hours,
            })
            .eq('id', existingCourse.id);
          
          if (updateError) {
            console.error(`Error updating course ${courseData.name}:`, updateError);
            errors.push({ course: courseData.name, error: updateError.message });
          } else {
            processedCourses.push({ ...courseData, id: existingCourse.id, action: 'updated' });
          }
        } else {
          // Insert new course
          const { data: newCourse, error: insertError } = await supabase
            .from('golf_courses')
            .insert(courseData)
            .select()
            .single();
          
          if (insertError) {
            console.error(`Error inserting course ${courseData.name}:`, insertError);
            errors.push({ course: courseData.name, error: insertError.message });
          } else {
            processedCourses.push({ ...newCourse, action: 'inserted' });
          }
        }
      } catch (error) {
        console.error(`Error processing course ${place.name}:`, error);
        errors.push({ course: place.name, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        coursesProcessed: processedCourses.length,
        courses: processedCourses,
        errors: errors,
        nextPageToken: data.next_page_token || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
