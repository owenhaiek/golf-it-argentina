
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReservationFormProps {
  courseId: string;
  courseName: string;
  courseLocation: string;
}

export function ReservationForm({ courseId, courseName, courseLocation }: ReservationFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [players, setPlayers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t("common", "error"),
        description: t("course", "loginRequired"),
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("reservations")
        .insert({
          user_id: user.id,
          course_id: courseId,
          course_name: courseName,
          course_location: courseLocation,
          date,
          time,
          players
        });
        
      if (error) throw error;
      
      toast({
        title: t("course", "reservationSuccess"),
        description: t("course", "reservationConfirmed"),
      });
      
      // Redirect to profile or show confirmation
      navigate("/settings");
      
    } catch (error: any) {
      toast({
        title: t("common", "error"),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("course", "bookTeeTime")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t("course", "date")}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">{t("course", "time")}</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="players">{t("course", "numberOfPlayers")}</Label>
            <Input
              id="players"
              type="number"
              min="1"
              max="4"
              value={players}
              onChange={(e) => setPlayers(parseInt(e.target.value))}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("common", "loading") : t("course", "bookNow")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
