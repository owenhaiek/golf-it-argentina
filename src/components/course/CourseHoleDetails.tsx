import { Flag, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  
  const generateHoleData = () => {
    const holeData = [];
    let actualHolePars = holePars;
    let actualHoleHandicaps = holeHandicaps;
    
    if (holePars.length === 9 && holes === 18) {
      actualHolePars = [...holePars, ...holePars];
    }
    
    if (holeHandicaps.length === 9 && holes === 18) {
      actualHoleHandicaps = [...holeHandicaps, ...holeHandicaps];
    }
    
    for (let i = 1; i <= holes; i++) {
      let par;
      if (actualHolePars && actualHolePars[i - 1]) {
        par = actualHolePars[i - 1];
      } else {
        if (i % 6 === 0 || i % 12 === 0) {
          par = 5;
        } else if (i % 3 === 0) {
          par = 3;
        } else {
          par = 4;
        }
      }
      
      let handicap;
      if (actualHoleHandicaps && actualHoleHandicaps[i - 1]) {
        handicap = actualHoleHandicaps[i - 1];
      } else {
        handicap = i <= 9 ? i * 2 - 1 : (i - 9) * 2;
        if (handicap > 18) handicap = handicap - 18;
      }
      
      holeData.push({ hole: i, par, handicap });
    }
    
    return holeData;
  };

  const holeData = generateHoleData();
  const frontNine = holeData.slice(0, 9);
  const backNine = holeData.slice(9, 18);
  
  const frontNinePar = frontNine.reduce((sum, hole) => sum + hole.par, 0);
  const backNinePar = backNine.reduce((sum, hole) => sum + hole.par, 0);
  const totalPar = frontNinePar + backNinePar;

  const getParColor = (par: number) => {
    switch (par) {
      case 3: return 'bg-blue-500/20 text-blue-400';
      case 4: return 'bg-zinc-700 text-zinc-300';
      case 5: return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-zinc-700 text-zinc-300';
    }
  };

  const HoleTable = ({ holesData, title, totalParValue }: {
    holesData: { hole: number; par: number; handicap: number }[];
    title: string;
    totalParValue: number;
  }) => (
    <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Flag className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[500px]">
          {/* Hole numbers */}
          <div className="flex items-center gap-1 mb-2">
            <div className="w-16 sm:w-20 text-xs text-zinc-500 font-medium">Hoyo</div>
            {holesData.map((hole) => (
              <div key={hole.hole} className="flex-1 text-center">
                <span className="text-xs sm:text-sm font-semibold text-white">{hole.hole}</span>
              </div>
            ))}
            <div className="w-12 sm:w-14 text-center">
              <span className="text-xs sm:text-sm font-semibold text-emerald-400">Total</span>
            </div>
          </div>
          
          {/* Par row */}
          <div className="flex items-center gap-1 mb-2 bg-zinc-800/50 rounded-xl p-2">
            <div className="w-16 sm:w-20 text-xs text-zinc-400 font-medium">Par</div>
            {holesData.map((hole) => (
              <div key={hole.hole} className="flex-1 flex justify-center">
                <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold ${getParColor(hole.par)}`}>
                  {hole.par}
                </span>
              </div>
            ))}
            <div className="w-12 sm:w-14 flex justify-center">
              <span className="w-8 h-6 sm:w-10 sm:h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs sm:text-sm font-bold text-emerald-400">
                {totalParValue}
              </span>
            </div>
          </div>
          
          {/* Handicap row */}
          <div className="flex items-center gap-1 p-2">
            <div className="w-16 sm:w-20 text-xs text-zinc-500 font-medium">Hcp</div>
            {holesData.map((hole) => (
              <div key={hole.hole} className="flex-1 text-center">
                <span className="text-xs text-zinc-500">{hole.handicap}</span>
              </div>
            ))}
            <div className="w-12 sm:w-14 text-center">
              <span className="text-xs text-zinc-600">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Course Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Flag className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{holes}</p>
          <p className="text-xs sm:text-sm text-zinc-400">{t("course", "totalHoles")}</p>
        </div>
        
        <div className="bg-zinc-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalPar}</p>
          <p className="text-xs sm:text-sm text-zinc-400">{t("course", "totalPar")}</p>
        </div>
      </div>

      {/* Front Nine */}
      <HoleTable 
        holesData={frontNine} 
        title={t("course", "frontNine")} 
        totalParValue={frontNinePar}
      />

      {/* Back Nine */}
      {holes === 18 && (
        <HoleTable 
          holesData={backNine} 
          title={t("course", "backNine")} 
          totalParValue={backNinePar}
        />
      )}

      {/* Par Distribution */}
      <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{t("course", "courseTotals")}</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-sm font-bold text-blue-400">3</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{holeData.filter(h => h.par === 3).length}</p>
            <p className="text-xs text-zinc-500">Par 3</p>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-zinc-600/50 flex items-center justify-center mx-auto mb-2">
              <span className="text-sm font-bold text-zinc-300">4</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{holeData.filter(h => h.par === 4).length}</p>
            <p className="text-xs text-zinc-500">Par 4</p>
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-sm font-bold text-emerald-400">5</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{holeData.filter(h => h.par === 5).length}</p>
            <p className="text-xs text-zinc-500">Par 5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHoleDetails;