
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zlmotrppstqjnovpfgbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbW90cnBwc3Rxam5vdnBmZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTcwOTYsImV4cCI6MjA1NjE5MzA5Nn0.1TwfkCE7nChIbPQIXZEjjLFoHFbProrDJ8UXrnvdMac";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type OpeningHourDay = {
  isOpen: boolean;
  open: string | null;
  close: string | null;
};

export type OpeningHours = OpeningHourDay[];

export type GolfCourse = {
  id: string;
  name: string;
  holes: number;
  par: number;
  address?: string;
  state?: string;
  city?: string;
  opening_hours?: string;
  image_url?: string;
  image_gallery?: string;
  description?: string;
  phone?: string;
  website?: string;
  hole_pars?: number[];
};
