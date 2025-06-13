
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";

interface ImagesCardProps {
  register: UseFormRegister<GolfCourseTemplate>;
}

export const ImagesCard: React.FC<ImagesCardProps> = ({ register }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="image_url">Imagen Principal (URL)</Label>
          <Input
            id="image_url"
            {...register("image_url")}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div>
          <Label htmlFor="image_gallery">Galería de Imágenes (URLs separadas por comas)</Label>
          <Textarea
            id="image_gallery"
            {...register("image_gallery")}
            placeholder="https://ejemplo.com/img1.jpg,https://ejemplo.com/img2.jpg"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
