import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, Calendar, Trophy, Target, Edit, Trash2, 
  Clock, Flame, CheckCircle2, CalendarClock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { parseLocalDate } from "@/utils/argentinaTimezone";

export type EventStatus = 'active' | 'upcoming' | 'completed';

interface EventCardProps {
  title: string;
  location?: string;
  date: string;
  status: EventStatus;
  icon: ReactNode;
  isCreator: boolean;
  canLoadScores?: boolean; // New prop: allows participants to load scores
  children?: ReactNode;
  onLoadScores?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  accentColor?: 'amber' | 'emerald' | 'red';
}

const statusConfig = {
  active: {
    label: 'En Juego',
    icon: Flame,
    bgClass: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    accentClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  upcoming: {
    label: 'Próximo',
    icon: CalendarClock,
    bgClass: 'from-blue-500/20 via-blue-500/5 to-transparent',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    accentClass: 'bg-gradient-to-r from-blue-400 to-blue-500',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
  },
  completed: {
    label: 'Finalizado',
    icon: CheckCircle2,
    bgClass: 'from-zinc-500/10 via-zinc-500/5 to-transparent',
    badgeClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    accentClass: 'bg-gradient-to-r from-zinc-400 to-zinc-500',
    iconBg: 'bg-zinc-500/15',
    iconColor: 'text-zinc-400',
  },
};

export const EventCard = ({
  title,
  location,
  date,
  status,
  icon,
  isCreator,
  canLoadScores = false,
  children,
  onLoadScores,
  onEdit,
  onDelete,
  accentColor = 'emerald',
}: EventCardProps) => {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  // Allow loading scores if user is creator or explicitly allowed
  const showLoadScores = isCreator || canLoadScores;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:border-border active:scale-[0.99]">
      {/* Accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${config.accentClass}`} />
      
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgClass} pointer-events-none`} />
      
      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${config.iconBg} shrink-0`}>
            {icon}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate leading-tight">
                {title}
              </h3>
              <Badge variant="outline" className={`${config.badgeClass} shrink-0 text-[10px] font-medium px-2 py-0.5`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            
            {location && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {location}
              </p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">
            {format(parseLocalDate(date), "EEEE d 'de' MMMM", { locale: es })}
          </span>
        </div>

        {/* Custom content */}
        {children}

        {/* Actions */}
        <div className="pt-1 space-y-2">
          {/* Load Scores button for active matches - for creator or allowed participants */}
          {status === 'active' && showLoadScores && onLoadScores && (
            <Button
              onClick={onLoadScores}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 rounded-xl shadow-lg shadow-primary/20"
            >
              <Target className="h-4 w-4 mr-2" />
              Cargar Puntajes
            </Button>
          )}

          {/* Edit/Delete buttons for creator - show for both active and upcoming */}
          {(status === 'active' || status === 'upcoming') && isCreator && (
            <div className="flex gap-2">
              <Button
                onClick={onEdit}
                variant="outline"
                className="flex-1 h-10 rounded-xl bg-muted/50 border-border hover:bg-muted"
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Editar
              </Button>
              <Button
                onClick={onDelete}
                variant="outline"
                className="flex-1 h-10 rounded-xl bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Eliminar
              </Button>
            </div>
          )}

          {status === 'completed' && (
            <div className="flex items-center justify-center gap-2 py-2.5 text-muted-foreground bg-muted/30 rounded-xl">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Evento finalizado</span>
            </div>
          )}

          {status === 'active' && !isCreator && (
            <div className="flex items-center justify-center gap-2 py-2.5 text-muted-foreground bg-muted/30 rounded-xl">
              <Flame className="h-4 w-4 text-emerald-400" />
              <span className="text-sm">En juego</span>
            </div>
          )}

          {status === 'upcoming' && !isCreator && (
            <div className="flex items-center justify-center gap-2 py-2.5 text-muted-foreground bg-muted/30 rounded-xl">
              <CalendarClock className="h-4 w-4 text-blue-400" />
              <span className="text-sm">
                Inicia el {format(parseLocalDate(date), "d 'de' MMM", { locale: es })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
