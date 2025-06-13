
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";

interface LocationCardProps {
  register: UseFormRegister<GolfCourseTemplate>;
}

export const LocationCard: React.FC<LocationCardProps> = ({ register }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Dirección completa del campo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="Ciudad"
            />
          </div>

          <div>
            <Label htmlFor="state">Estado/Provincia</Label>
            <Input
              id="state"
              {...register("state")}
              placeholder="Estado o provincia"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitud</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register("latitude", { valueAsNumber: true })}
              placeholder="-34.6118"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Coordenada de latitud (ejemplo: -34.6118)
            </p>
          </div>

          <div>
            <Label htmlFor="longitude">Longitud</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register("longitude", { valueAsNumber: true })}
              placeholder="-58.3816"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Coordenada de longitud (ejemplo: -58.3816)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
