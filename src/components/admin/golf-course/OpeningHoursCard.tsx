
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface OpeningHoursCardProps {
  openingHours: Array<{
    isOpen: boolean;
    open: string;
    close: string;
  }>;
  updateOpeningHours: (dayIndex: number, field: string, value: any) => void;
}

export const OpeningHoursCard: React.FC<OpeningHoursCardProps> = ({
  openingHours,
  updateOpeningHours,
}) => {
  const daysOfWeek = [
    "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Apertura</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-20 font-medium">{day}</div>
              <Switch
                checked={openingHours[index]?.isOpen || false}
                onCheckedChange={(checked) => updateOpeningHours(index, "isOpen", checked)}
              />
              {openingHours[index]?.isOpen && (
                <>
                  <Input
                    type="time"
                    value={openingHours[index]?.open || ""}
                    onChange={(e) => updateOpeningHours(index, "open", e.target.value)}
                    className="w-32"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={openingHours[index]?.close || ""}
                    onChange={(e) => updateOpeningHours(index, "close", e.target.value)}
                    className="w-32"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
