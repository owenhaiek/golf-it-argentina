import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

// Function to add a golf course to the database
export async function addGolfCourse(course: {
  name: string;
  holes: number;
  par: number;
  address?: string;
  state?: string;
  city?: string;
  opening_hours: Array<{
    isOpen: boolean;
    open: string | null;
    close: string | null;
  }>;
}) {
  try {
    const { data, error } = await supabase.from("golf_courses").insert({
      name: course.name,
      holes: course.holes,
      par: course.par,
      address: course.address || null,
      state: course.state || null,
      city: course.city || null,
      opening_hours: course.opening_hours || null,
      hole_pars: Array(course.holes).fill(4), // Default par 4 for each hole
    });

    if (error) {
      console.error("Error adding course:", error);
      return { success: false, error };
    }

    console.log("Course added successfully:", course.name);
    return { success: true, data };
  } catch (err) {
    console.error("Exception when adding course:", err);
    return { success: false, error: err };
  }
}

// Add the specified golf courses
export async function addSpecifiedGolfCourses() {
  // Olivos Golf Club
  await addGolfCourse({
    name: "Olivos Golf Club",
    holes: 27,
    par: 72,
    address: "Ruta Panamericana Ramal Pilar, Km 40.5, Olivos",
    state: "Buenos Aires",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday - Closed
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
      { isOpen: true, open: "08:00", close: "18:00" }, // Friday
      { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
      { isOpen: true, open: "08:00", close: "18:00" }, // Sunday
    ],
  });

  // Update Buenos Aires Golf Club
  // First, get the existing entry if it exists
  const { data: existingBAGC } = await supabase
    .from("golf_courses")
    .select("id")
    .eq("name", "Buenos Aires Golf Club")
    .maybeSingle();

  if (existingBAGC) {
    // Update the existing entry
    await supabase
      .from("golf_courses")
      .update({
        holes: 27,
        par: 72,
        address: "Av. Campos Salles 1275, San Miguel",
        state: "Buenos Aires",
        opening_hours: [
          { isOpen: false, open: null, close: null }, // Monday - Closed
          { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
          { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
          { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
          { isOpen: true, open: "08:00", close: "18:00" }, // Friday
          { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
          { isOpen: true, open: "08:00", close: "18:00" }, // Sunday
        ],
      })
      .eq("id", existingBAGC.id);
    console.log("Updated Buenos Aires Golf Club");
  } else {
    // Add as a new entry
    await addGolfCourse({
      name: "Buenos Aires Golf Club",
      holes: 27,
      par: 72,
      address: "Av. Campos Salles 1275, San Miguel",
      state: "Buenos Aires",
      opening_hours: [
        { isOpen: false, open: null, close: null }, // Monday - Closed
        { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
        { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
        { isOpen: true, open: "08:00", close: "18:00" }, // Thursday
        { isOpen: true, open: "08:00", close: "18:00" }, // Friday
        { isOpen: true, open: "08:00", close: "18:00" }, // Saturday
        { isOpen: true, open: "08:00", close: "18:00" }, // Sunday
      ],
    });
  }

  // Jockey Club Argentino
  await addGolfCourse({
    name: "Jockey Club Argentino (Colorada Y Azul)",
    holes: 36,
    par: 72,
    address: "Av. Márquez 1702, San Isidro",
    state: "Buenos Aires",
    opening_hours: [
      { isOpen: false, open: null, close: null }, // Monday - Closed
      { isOpen: true, open: "08:00", close: "18:00" }, // Tuesday
      { isOpen: true, open: "08:00", close: "18:00" }, // Wednesday
      { isOpen: false, open: null, close: null }, // Thursday - Closed
      { isOpen: false, open: null, close: null }, // Friday - Closed
      { isOpen: false, open: null, close: null }, // Saturday - Closed
      { isOpen: false, open: null, close: null }, // Sunday - Closed
    ],
  });

  return { success: true, message: "All courses added/updated successfully" };
}
