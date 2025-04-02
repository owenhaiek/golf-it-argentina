
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
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReservationFormProps {
  courseId: string;
  courseName: string;
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
});

type FormValues = z.infer<typeof formSchema>;

const ReservationForm = ({ courseId, courseName }: ReservationFormProps) => {
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      players: 1,
    },
  });

  const onSubmit = (data: FormValues) => {
    const formattedDate = format(data.date, "PPPP");
    const message = `Reservation submitted for ${courseName} on ${formattedDate} at ${data.time} for ${data.players} player${data.players > 1 ? 's' : ''}`;
    
    console.log("Reservation details:", { courseId, ...data });
    
    // Show success message
    toast({
      title: language === "en" ? "Reservation Submitted" : "Reserva Enviada",
      description: language === "en" ? message : `Reserva enviada para ${courseName} el ${formattedDate} a las ${data.time} para ${data.players} jugador${data.players > 1 ? 'es' : ''}`,
    });
    
    // Close dialog
    setOpen(false);
    
    // Reset form
    form.reset({
      players: 1,
    });
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="w-full bg-secondary flex gap-2 items-center justify-center"
      >
        <CalendarIcon size={16} />
        {language === "en" ? "Book Tee Time" : "Reservar Horario"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
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
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
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
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {language === "en" ? "Cancel" : "Cancelar"}
                </Button>
                <Button type="submit">{language === "en" ? "Book Tee Time" : "Reservar Horario"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReservationForm;
