
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";

interface BasicInfoCardProps {
  register: UseFormRegister<GolfCourseTemplate>;
  errors: FieldErrors<GolfCourseTemplate>;
}

export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ register, errors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Campo*</Label>
          <Input
            id="name"
            {...register("name", { required: "El nombre es requerido" })}
            placeholder="Nombre del campo de golf"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">Tipo de Campo</Label>
          <Input
            id="type"
            {...register("type")}
            placeholder="Standard, Championship, Executive, etc."
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descripción del campo de golf"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="established_year">Año de Establecimiento</Label>
            <Input
              id="established_year"
              type="number"
              {...register("established_year", { 
                valueAsNumber: true,
                min: 1800,
                max: new Date().getFullYear()
              })}
              placeholder="1995"
            />
          </div>

          <div>
            <Label htmlFor="holes">Número de Hoyos*</Label>
            <Input
              id="holes"
              type="number"
              {...register("holes", { 
                required: "El número de hoyos es requerido",
                valueAsNumber: true,
                min: 1,
                max: 36
              })}
              placeholder="18"
            />
            {errors.holes && (
              <p className="text-sm text-red-500 mt-1">{errors.holes.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="par">Par Total</Label>
          <Input
            id="par"
            type="number"
            {...register("par", { valueAsNumber: true, min: 27, max: 144 })}
            placeholder="72"
          />
        </div>
      </CardContent>
    </Card>
  );
};
