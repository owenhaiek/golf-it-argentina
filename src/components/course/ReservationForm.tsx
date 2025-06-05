
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
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
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

const formSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  players: z.number().min(1).max(4),
  playerName: z.string().min(1, "Player name is required"),
  license: z.string().min(1, "License/Matricula is required"),
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
      playerName: "",
      license: "",
    },
  });

  // Create reservation mutation
  const reservation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from("reservations").insert({
        course_id: courseId,
        course_name: courseName,
        course_location: courseLocation,
        date: data.date.toISOString().split('T')[0],
        time: data.time,
        players: data.players,
        player_name: data.playerName,
        license: data.license,
        user_id: user.id,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["reservations", user?.id] });
      
      const formattedDate = format(data.date, "PPPP");
      
      // Show success message
      toast({
        title: language === "en" ? "Reservation Submitted" : "Reserva Enviada",
        description: language === "en" 
          ? `Reservation submitted for ${courseName} on ${formattedDate} at ${data.time} for ${data.players} player${data.players > 1 ? 's' : ''}`
          : `Reserva enviada para ${courseName} el ${formattedDate} a las ${data.time} para ${data.players} jugador${data.players > 1 ? 'es' : ''}`,
      });
      
      // Close dialog
      setOpen(false);
      
      // Reset form
      form.reset({
        players: 1,
        playerName: "",
        license: "",
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
        <DialogContent className="sm:max-w-[425px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === "en" ? "Book a Tee Time" : "Reservar un Horario"}</DialogTitle>
            <DialogDescription>
              {language === "en" 
                ? `Reserve your tee time at ${courseName}. Fill in the details below.` 
                : `Reserva tu horario en ${courseName}. Completa los detalles a continuación.`}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
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
                      <PopoverContent className="w-auto p-0 bg-white pointer-events-auto" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            // Can't book in the past or more than 30 days ahead
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const thirtyDaysFromNow = new Date();
                            thirtyDaysFromNow.setDate(today.getDate() + 30);
                            return date < today || date > thirtyDaysFromNow;
                          }}
                          initialFocus
                          className="bg-white"
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
                      <PopoverContent className="w-auto p-0 bg-white pointer-events-auto" align="start">
                        <ScrollArea className="h-64 bg-white p-2">
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={field.value === time ? "default" : "outline"}
                                className="text-sm"
                                onClick={() => {
                                  field.onChange(time);
                                }}
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
                          onClick={() => form.setValue("players", num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Player Name" : "Nombre del Jugador"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Enter player name" : "Ingrese nombre del jugador"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "License/Matricula" : "Licencia/Matrícula"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "en" ? "Enter license number" : "Ingrese número de matrícula"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={reservation.isPending}
                >
                  {language === "en" ? "Cancel" : "Cancelar"}
                </Button>
                <Button 
                  type="submit"
                  disabled={reservation.isPending}
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReservationForm;
