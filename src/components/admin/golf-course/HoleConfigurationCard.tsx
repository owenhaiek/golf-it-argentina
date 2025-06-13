
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HoleConfigurationCardProps {
  holes: number;
  holePars: number[];
  holeHandicaps: number[];
  updateHolePar: (holeIndex: number, par: number) => void;
  updateHoleHandicap: (holeIndex: number, handicap: number) => void;
}

export const HoleConfigurationCard: React.FC<HoleConfigurationCardProps> = ({
  holes,
  holePars,
  holeHandicaps,
  updateHolePar,
  updateHoleHandicap,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Hoyos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: holes }, (_, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <div className="font-medium text-center">Hoyo {i + 1}</div>
              <div>
                <Label className="text-xs">Par</Label>
                <Input
                  type="number"
                  min="3"
                  max="6"
                  value={holePars[i] || 4}
                  onChange={(e) => updateHolePar(i, parseInt(e.target.value) || 4)}
                  className="text-center"
                />
              </div>
              <div>
                <Label className="text-xs">Handicap</Label>
                <Input
                  type="number"
                  min="1"
                  max={holes}
                  value={holeHandicaps[i] || 1}
                  onChange={(e) => updateHoleHandicap(i, parseInt(e.target.value) || 1)}
                  className="text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
