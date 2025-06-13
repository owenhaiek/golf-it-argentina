
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";

interface ContactCardProps {
  register: UseFormRegister<GolfCourseTemplate>;
}

export const ContactCard: React.FC<ContactCardProps> = ({ register }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+54 11 1234-5678"
          />
        </div>

        <div>
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            {...register("website")}
            placeholder="https://www.campo.com"
          />
        </div>
      </CardContent>
    </Card>
  );
};
