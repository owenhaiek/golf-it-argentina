import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Swords, Calendar, MapPin, Search, Flag, Check, ChevronRight, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const CreateMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriendsData();
  const { courses, isLoading: coursesLoading } = useGolfCourses("", {
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false,
    minRating: 0
  });
  const { t } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [courseSearch, setCourseSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    opponentId: "",
    courseId: "",
    matchDate: "",
    matchType: "stroke_play",
    stakes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const selectedOpponent = friends.find(friend => friend.id === formData.opponentId);
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.city?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.name || !formData.opponentId || !formData.courseId || !formData.matchDate) {
      toast.error(t("matches", "fillRequiredFields"));
      return;
    }

    const selectedDate = new Date(formData.matchDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error(t("matches", "matchDatePast"));
      return;
    }
    
    const isSameDayMatch = selectedDate.getTime() === today.getTime();

    setIsLoading(true);
    
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          name: formData.name,
          creator_id: user.id,
          opponent_id: formData.opponentId,
          course_id: formData.courseId,
          match_date: formData.matchDate,
          match_type: formData.matchType,
          stakes: formData.stakes || null,
          status: isSameDayMatch ? 'accepted' : 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      if (isSameDayMatch) {
        toast.success("Match created and ready to play!");
      } else {
        toast.success(t("matches", "matchChallengeSent"));
      }
      navigate("/friends");
    } catch (error: any) {
      console.error("Error creating match:", error);
      toast.error(t("matches", "failedToCreate"));
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = !!formData.courseId;
  const canProceedStep2 = !!formData.opponentId;
  const canSubmit = canProceedStep1 && canProceedStep2 && !!formData.name && !!formData.matchDate;
  
  const isSameDay = formData.matchDate && new Date(formData.matchDate).toDateString() === new Date().toDateString();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="h-10 w-10 p-0 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Swords className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t("matches", "challengeFriend")}</h1>
                <p className="text-xs text-muted-foreground">
                  {step === 1 ? "Selecciona el campo" : step === 2 ? "Elige tu oponente" : "Detalles del match"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-red-500' : s < step ? 'w-2 bg-red-500' : 'w-2 bg-muted'
                }`}
                layoutId={`match-step-${s}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Course Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 max-w-2xl mx-auto w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar campo de golf..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 px-4">
                <div className="max-w-2xl mx-auto pb-32 space-y-3">
                  {coursesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full" />
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No se encontraron campos</p>
                    </div>
                  ) : (
                    filteredCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleInputChange("courseId", course.id)}
                        className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                          formData.courseId === course.id
                            ? 'ring-2 ring-red-500 scale-[1.02]'
                            : 'hover:scale-[1.01]'
                        }`}
                      >
                        <div className="relative h-32">
                          <img
                            src={course.image_url || '/placeholder.svg'}
                            alt={course.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {formData.courseId === course.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center"
                            >
                              <Check className="h-5 w-5 text-white" />
                            </motion.div>
                          )}
                          
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-semibold text-white text-lg">{course.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-white/80 text-sm flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {course.city || 'Argentina'}
                              </span>
                              <span className="text-white/80 text-sm flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                {course.holes} hoyos
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Fixed bottom buttons - Two column layout */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
                <div className="max-w-2xl mx-auto flex gap-3">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-semibold text-base"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Volver al mapa
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-base shadow-lg shadow-red-500/25"
                  >
                    Continuar
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Opponent Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 pb-32 max-w-2xl mx-auto space-y-4">
                {/* Selected course preview */}
                {selectedCourse && (
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="relative h-20">
                      <img
                        src={selectedCourse.image_url || '/placeholder.svg'}
                        alt={selectedCourse.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                      <div className="absolute inset-0 flex items-center p-4">
                        <div>
                          <p className="text-red-400 text-xs font-medium">Campo seleccionado</p>
                          <h3 className="font-semibold text-white">{selectedCourse.name}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h2 className="text-lg font-semibold">Elige tu oponente</h2>

                {friends.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Swords className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t("matches", "noFriendsAvailable")}</p>
                    <p className="text-sm">{t("matches", "addFriendsToChallenge")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleInputChange("opponentId", friend.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                          formData.opponentId === friend.id
                            ? 'bg-red-500/10 ring-1 ring-red-500/30'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-14 w-14 ring-2 ring-background">
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback className="bg-red-500/10 text-red-600 font-semibold text-lg">
                              {friend.full_name?.charAt(0) || friend.username?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-lg">
                              {friend.full_name || friend.username || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{friend.username || 'user'}
                            </p>
                          </div>
                        </div>
                        <RadioGroup value={formData.opponentId}>
                          <RadioGroupItem 
                            value={friend.id} 
                            className="h-6 w-6 border-2 text-red-500 border-muted-foreground/30 data-[state=checked]:border-red-500"
                          />
                        </RadioGroup>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fixed bottom buttons - Two column layout */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
                <div className="max-w-2xl mx-auto flex gap-3">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-semibold text-base"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Volver al mapa
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-base shadow-lg shadow-red-500/25"
                  >
                    Continuar
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Match Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 pb-32 max-w-2xl mx-auto space-y-6">
                {/* Match preview */}
                {selectedOpponent && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 p-6"
                  >
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <Avatar className="h-16 w-16 mx-auto ring-4 ring-red-500/20">
                          <AvatarImage src={user?.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-red-500 text-white font-bold text-xl">
                            {user?.user_metadata?.full_name?.charAt(0) || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium mt-2 text-sm">{t("matches", "you")}</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Swords className="h-6 w-6 text-red-500" />
                        </div>
                        <span className="text-xs font-medium text-red-500 mt-1">VS</span>
                      </div>
                      
                      <div className="text-center">
                        <Avatar className="h-16 w-16 mx-auto ring-4 ring-red-500/20">
                          <AvatarImage src={selectedOpponent.avatar_url} />
                          <AvatarFallback className="bg-red-500 text-white font-bold text-xl">
                            {selectedOpponent.full_name?.charAt(0) || selectedOpponent.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium mt-2 text-sm">
                          {selectedOpponent.full_name?.split(' ')[0] || selectedOpponent.username}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("matches", "matchNameRequired")}</Label>
                    <Input
                      placeholder={t("matches", "matchNamePlaceholder")}
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      {t("matches", "matchDateRequired")}
                    </Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.matchDate}
                      onChange={(e) => handleInputChange("matchDate", e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                    />
                    {isSameDay && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-xl"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Match instantáneo - ¡listo para jugar!</span>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t("matches", "matchFormatRequired")}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "stroke_play", label: t("matches", "strokePlay"), desc: "Menor puntaje total gana" },
                        { value: "match_play", label: t("matches", "matchPlay"), desc: "Gana más hoyos" }
                      ].map((type) => (
                        <motion.div
                          key={type.value}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange("matchType", type.value)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            formData.matchType === type.value
                              ? 'bg-red-500/10 ring-1 ring-red-500/30'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("matches", "stakesOptional")}</Label>
                    <Input
                      placeholder={t("matches", "stakesPlaceholder")}
                      value={formData.stakes}
                      onChange={(e) => handleInputChange("stakes", e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed bottom buttons - Two column layout */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
                <div className="max-w-2xl mx-auto flex gap-3">
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-semibold text-base"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Volver al mapa
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !canSubmit}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-base shadow-lg shadow-red-500/25"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Enviando...
                      </div>
                    ) : (
                      <>
                        <Swords className="h-5 w-5 mr-2" />
                        {isSameDay ? "Crear Match" : "Enviar Reto"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateMatch;