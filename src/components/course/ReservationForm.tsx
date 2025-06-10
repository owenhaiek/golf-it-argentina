
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar as CalendarIcon, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReservationFormProps {
  courseId: string;
  courseName: string;
  courseLocation: string;
}

const timeSlots = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", 
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00"
];

interface Player {
  name: string;
  license: string;
}

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  players: z.number().min(1).max(4),
  playerList: z.array(z.object({
    name: z.string().min(1, "Player name is required"),
    license: z.string().min(1, "License/Matricula is required"),
  })).min(1, "At least one player is required"),
});

type FormValues = z.infer<typeof formSchema>;

const ReservationForm = ({ courseId, courseName, courseLocation }: ReservationFormProps) => {
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      players: 1,
      playerList: [{ name: "", license: "" }],
    },
  });

  const playersCount = form.watch("players");
  const playerList = form.watch("playerList");

  // Update player list when player count changes
  const updatePlayerList = (count: number) => {
    const currentList = form.getValues("playerList");
    const newList = [...currentList];
    
    if (count > currentList.length) {
      // Add new players
      for (let i = currentList.length; i < count; i++) {
        newList.push({ name: "", license: "" });
      }
    } else {
      // Remove excess players
      newList.splice(count);
    }
    
    form.setValue("playerList", newList);
  };

  // Create reservation mutation
  const reservation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Creating reservation with data:", data);
      
      const reservationData = {
        course_id: courseId,
        course_name: courseName,
        course_location: courseLocation,
        date: data.date.toISOString().split('T')[0],
        time: data.time,
        players: data.players,
        player_name: data.playerList[0].name,
        license: data.playerList[0].license,
        additional_players: data.playerList.length > 1 ? JSON.stringify(data.playerList.slice(1)) : null,
        user_id: user.id,
        status: 'pending'
      };
      
      console.log("Inserting reservation data:", reservationData);
      
      const { error } = await supabase.from("reservations").insert(reservationData);
      
      if (error) {
        console.error("Reservation creation error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations", user?.id] });
      
      const formattedDate = format(data.date, "PPPP");
      
      toast({
        title: language === "en" ? "Reservation Submitted" : "Reserva Enviada",
        description: language === "en" 
          ? `Reservation submitted for ${courseName} on ${formattedDate} at ${data.time} for ${data.players} player${data.players > 1 ? 's' : ''}`
          : `Reserva enviada para ${courseName} el ${formattedDate} a las ${data.time} para ${data.players} jugador${data.players > 1 ? 'es' : ''}`,
      });
      
      setOpen(false);
      form.reset({
        players: 1,
        playerList: [{ name: "", license: "" }],
      });
    },
    onError: (error) => {
      console.error("Error creating reservation:", error);
      toast({
        title: language === "en" ? "Error" : "Error",
        description: language === "en" 
          ? "There was an error submitting your reservation. Please try again." 
          : "Hubo un error al enviar tu reserva. Por favor intenta de nuevo.",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);
    
    // Validate that we have the correct number of players
    if (data.playerList.length !== data.players) {
      toast({
        title: language === "en" ? "Player Count Mismatch" : "Diferencia en Número de Jugadores",
        description: language === "en" 
          ? `Please provide details for exactly ${data.players} player${data.players > 1 ? 's' : ''}` 
          : `Por favor proporciona detalles para exactamente ${data.players} jugador${data.players > 1 ? 'es' : ''}`,
        variant: "destructive"
      });
      return;
    }
    
    // Validate that all players have names and licenses
    const hasAllPlayerInfo = data.playerList.every(player => 
      player.name.trim() && player.license.trim()
    );
    
    if (!hasAllPlayerInfo) {
      toast({
        title: language === "en" ? "Incomplete Information" : "Información Incompleta",
        description: language === "en" 
          ? "Please fill in name and license for all players" 
          : "Por favor completa el nombre y matrícula de todos los jugadores",
        variant: "destructive"
      });
      return;
    }
    
    reservation.mutate(data);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="w-full bg-secondary flex gap-2 items-center justify-center"
      >
        <CalendarIcon size={16} />
        {t("reservations", "bookTeeTime")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{language === "en" ? "Book a Tee Time" : "Reservar un Horario"}</DialogTitle>
            <DialogDescription>
              {language === "en" 
                ? `Reserve your tee time at ${courseName}. Fill in the details below.` 
                : `Reserva tu horario en ${courseName}. Completa los detalles a continuación.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden min-h-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-6 pt-2 px-1 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{language === "en" ? "Date" : "Fecha"}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{language === "en" ? "Select date" : "Seleccionar fecha"}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const thirtyDaysFromNow = new Date();
                                  thirtyDaysFromNow.setDate(today.getDate() + 30);
                                  return date < today || date > thirtyDaysFromNow;
                                }}
                                initialFocus
                                className="bg-white pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === "en" ? "Time" : "Hora"}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value || <span>{language === "en" ? "Select time" : "Seleccionar hora"}</span>}
                                  <Clock className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                              <ScrollArea className="h-64 bg-white p-2">
                                <div className="grid grid-cols-3 gap-2">
                                  {timeSlots.map((time) => (
                                    <Button
                                      key={time}
                                      type="button"
                                      variant={field.value === time ? "default" : "outline"}
                                      className="text-sm"
                                      onClick={() => field.onChange(time)}
                                    >
                                      {time}
                                    </Button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="players"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === "en" ? "Number of players" : "Número de jugadores"}</FormLabel>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <Button
                              key={num}
                              type="button"
                              variant={field.value === num ? "default" : "outline"}
                              className="flex-1"
                              onClick={() => {
                                form.setValue("players", num);
                                updatePlayerList(num);
                              }}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Player Details with improved scrolling */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {language === "en" ? "Player Details" : "Detalles de Jugadores"}
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      {playerList.map((player, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-lg bg-gray-50">
                          <div className="md:col-span-2">
                            <h5 className="text-sm font-medium mb-2">
                              {language === "en" ? `Player ${index + 1}` : `Jugador ${index + 1}`}
                              {index === 0 && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({language === "en" ? "Main contact" : "Contacto principal"})
                                </span>
                              )}
                            </h5>
                          </div>
                          <div>
                            <FormLabel className="text-xs">
                              {language === "en" ? "Name" : "Nombre"}
                            </FormLabel>
                            <Input
                              placeholder={language === "en" ? "Player name" : "Nombre del jugador"}
                              value={player.name}
                              onChange={(e) => {
                                const newList = [...playerList];
                                newList[index].name = e.target.value;
                                form.setValue("playerList", newList);
                              }}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <FormLabel className="text-xs">
                              {language === "en" ? "License/Matricula" : "Licencia/Matrícula"}
                            </FormLabel>
                            <Input
                              placeholder={language === "en" ? "License number" : "Número de matrícula"}
                              value={player.license}
                              onChange={(e) => {
                                const newList = [...playerList];
                                newList[index].license = e.target.value;
                                form.setValue("playerList", newList);
                              }}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 flex-shrink-0 pt-4 border-t bg-white">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={reservation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {language === "en" ? "Cancel" : "Cancelar"}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={reservation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {reservation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === "en" ? "Submitting..." : "Enviando..."}
                      </>
                    ) : (
                      t("reservations", "bookTeeTime")
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReservationForm;
