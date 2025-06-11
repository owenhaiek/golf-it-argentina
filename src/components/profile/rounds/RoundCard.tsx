
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Round } from "./types";

interface RoundCardProps {
  round: Round;
}

const RoundCard = ({ round }: RoundCardProps) => {
  const navigate = useNavigate();
  const coursePar = round.golf_courses?.par || 72;
  const vsPar = round.score - coursePar;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {format(new Date(round.date), "MMM d, yyyy")}
            </span>
          </div>
          <Badge variant="secondary">
            {round.score}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {round.golf_courses?.name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              vs Par:
            </span>
            {vsPar === 0 ? (
              <Badge variant="outline">Even</Badge>
            ) : vsPar > 0 ? (
              <Badge variant="destructive">+{vsPar}</Badge>
            ) : (
              <Badge variant="success">{vsPar}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/course/${round.course_id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoundCard;
