import { MapPin, Phone, Globe, ChevronRight } from "lucide-react";

interface CourseCTARowProps {
  course: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    website?: string | null;
  };
  language: string;
  onLocationClick: () => void;
  onPhoneClick: () => void;
  onWebsiteClick: () => void;
}

export function CourseCTARow({ course, language, onLocationClick, onPhoneClick, onWebsiteClick }: CourseCTARowProps) {
  const ctaItems = [
    {
      id: 'directions',
      show: !!course.address,
      icon: MapPin,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      title: language === "en" ? "Directions" : "Direcciones",
      subtitle: [course.address, course.city].filter(Boolean).join(', ') || 'Ver ubicación',
      onClick: onLocationClick,
    },
    {
      id: 'phone',
      show: !!course.phone,
      icon: Phone,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      title: language === "en" ? "Call" : "Llamar",
      subtitle: course.phone || '',
      onClick: onPhoneClick,
    },
    {
      id: 'website',
      show: !!course.website,
      icon: Globe,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      title: language === "en" ? "Website" : "Sitio Web",
      subtitle: 'Visitar página',
      onClick: onWebsiteClick,
    },
  ].filter(item => item.show);

  if (ctaItems.length === 0) return null;

  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden">
      {ctaItems.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === ctaItems.length - 1;
        
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors ${
              !isLast ? 'border-b border-zinc-800' : ''
            }`}
          >
            <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-white text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{item.subtitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600 flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
}