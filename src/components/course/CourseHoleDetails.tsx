
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseHoleDetailsProps {
  coursePar?: number;
  holes?: number;
  holePars?: number[];
  holeHandicaps?: number[];
}

const CourseHoleDetails = ({ 
  coursePar = 72, 
  holes = 18, 
  holePars = [],
  holeHandicaps = []
}: CourseHoleDetailsProps) => {
  
  // Generate hole data using real course data when available
  const generateHoleData = () => {
    const holeData = [];
    
    // Handle 9-hole courses by duplicating data for 18 holes if needed
    let actualHolePars = holePars;
    let actualHoleHandicaps = holeHandicaps;
    
    // If we have 9 hole pars but need 18 holes, duplicate them
    if (holePars.length === 9 && holes === 18) {
      actualHolePars = [...holePars, ...holePars];
    }
    
    // If we have 9 hole handicaps but need 18 holes, duplicate them
    if (holeHandicaps.length === 9 && holes === 18) {
      actualHoleHandicaps = [...holeHandicaps, ...holeHandicaps];
    }
    
    for (let i = 1; i <= holes; i++) {
      // Use actual hole par if available, otherwise generate realistic defaults
      let par;
      if (actualHolePars && actualHolePars[i - 1]) {
        par = actualHolePars[i - 1];
      } else {
        // Generate realistic par distribution as fallback
        if (i % 6 === 0 || i % 12 === 0) {
          par = 5; // Par 5 holes
        } else if (i % 3 === 0) {
          par = 3; // Par 3 holes
        } else {
          par = 4; // Par 4 holes (most common)
        }
      }
      
      // Use actual handicap if available, otherwise generate defaults
      let handicap;
      if (actualHoleHandicaps && actualHoleHandicaps[i - 1]) {
        handicap = actualHoleHandicaps[i - 1];
      } else {
        // Generate handicap (difficulty rating 1-18)
        handicap = i <= 9 ? i * 2 - 1 : (i - 9) * 2;
        if (handicap > 18) handicap = handicap - 18;
      }
      
      holeData.push({
        hole: i,
        par: par,
        handicap: handicap
      });
    }
    
    return holeData;
  };

  const holeData = generateHoleData();
  const frontNine = holeData.slice(0, 9);
  const backNine = holeData.slice(9, 18);
  
  const frontNinePar = frontNine.reduce((sum, hole) => sum + hole.par, 0);
  const backNinePar = backNine.reduce((sum, hole) => sum + hole.par, 0);
  const totalPar = frontNinePar + backNinePar;

  const HoleTable = ({ holes, title, totalPar }: {
    holes: any[], 
    title: string, 
    totalPar: number
  }) => (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center font-semibold">Hole</TableHead>
              {holes.map((hole) => (
                <TableHead key={hole.hole} className="text-center min-w-[50px]">
                  {hole.hole}
                </TableHead>
              ))}
              <TableHead className="text-center font-semibold bg-primary/5">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="font-medium">Par</TableCell>
              {holes.map((hole) => (
                <TableCell key={hole.hole} className="text-center">
                  <Badge variant={hole.par === 3 ? "secondary" : hole.par === 5 ? "default" : "outline"}>
                    {hole.par}
                  </Badge>
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-primary/5">{totalPar}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="font-medium">Handicap</TableCell>
              {holes.map((hole) => (
                <TableCell key={hole.hole} className="text-center text-sm text-muted-foreground">
                  {hole.handicap}
                </TableCell>
              ))}
              <TableCell className="text-center text-muted-foreground bg-primary/5">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Course Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Holes</p>
                <p className="text-2xl font-bold">{holes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Par</p>
                <p className="text-2xl font-bold">{totalPar}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Front Nine */}
      <HoleTable 
        holes={frontNine} 
        title="Front Nine" 
        totalPar={frontNinePar}
      />

      {/* Back Nine */}
      {holes === 18 && (
        <HoleTable 
          holes={backNine} 
          title="Back Nine" 
          totalPar={backNinePar}
        />
      )}

      {/* Course Totals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Course Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Par 3 Holes</p>
              <p className="text-xl font-bold">{holeData.filter(h => h.par === 3).length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Par 4 Holes</p>
              <p className="text-xl font-bold">{holeData.filter(h => h.par === 4).length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Par 5 Holes</p>
              <p className="text-xl font-bold">{holeData.filter(h => h.par === 5).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseHoleDetails;
