
export interface Round {
  id: string;
  score: number;
  created_at: string;
  date: string;
  golf_courses: {
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

export interface RecentRoundsProps {
  userId?: string;
  rounds: Round[] | null;
  roundsLoading: boolean;
  onDeleteRound?: (roundId: string) => void;
  deletingRoundId?: string | null;
}
