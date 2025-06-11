
export interface Round {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  score: number;
  notes?: string;
  created_at: string;
  golf_courses?: {
    name: string;
    hole_pars: number[];
    holes: number;
    image_url?: string;
    address?: string;
    city?: string;
    state?: string;
    par?: number;
  };
}
