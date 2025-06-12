
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag } from "lucide-react";

interface CourseHoleDetailsProps {
  holePars?: number[] | null;
  holeHandicaps?: number[] | null;
}

export const CourseHoleDetails = ({ 
  holePars, 
  holeHandicaps 
}: CourseHoleDetailsProps) => {
  if (!holePars || holePars.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Hole Details</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-2 text-left">Hole</th>
              {holePars.map((_, i) => (
                <th key={i} className="px-2 py-2 text-center">{i + 1}</th>
              ))}
              <th className="px-2 py-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-2 font-medium">Par</td>
              {holePars.map((par, i) => (
                <td key={i} className="px-2 py-2 text-center">{par}</td>
              ))}
              <td className="px-2 py-2 text-center font-medium">
                {holePars.reduce((sum, par) => sum + par, 0)}
              </td>
            </tr>
            {holeHandicaps && holeHandicaps.length > 0 && (
              <tr>
                <td className="px-2 py-2 font-medium">Handicap</td>
                {holeHandicaps.map((handicap, i) => (
                  <td key={i} className="px-2 py-2 text-center">{handicap}</td>
                ))}
                <td className="px-2 py-2 text-center">-</td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default CourseHoleDetails;
