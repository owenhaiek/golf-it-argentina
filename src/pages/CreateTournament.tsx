import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trophy, Users, Calendar, MapPin, Check, ChevronRight, Search, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CreateTournament = () => {
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
    description: "",
    courseId: "",
    startDate: "",
    startTime: "",
    maxPlayers: 8,
    tournamentType: "stroke_play"
  });
  
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const handleExitToMap = () => {
    sessionStorage.setItem('map-entry-animation', 'true');
    navigate('/');
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.city?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleParticipant = (friendId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.name || !formData.courseId || !formData.startDate) {
      toast.error(t("tournaments", "fillRequiredFields"));
      return;
    }
    if (selectedParticipants.length === 0) {
      toast.error(t("tournaments", "selectOneParticipant"));
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          description: formData.description,
          course_id: formData.courseId,
          creator_id: user.id,
          start_date: formData.startDate,
          end_date: formData.startDate,
          max_players: formData.maxPlayers,
          entry_fee: 0,
          prize_pool: 0,
          tournament_type: formData.tournamentType
        })
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      const participantInserts = [
        { tournament_id: tournament.id, user_id: user.id, status: 'confirmed' },
        ...selectedParticipants.map(userId => ({
          tournament_id: tournament.id,
          user_id: userId,
          status: 'registered'
        }))
      ];

      const { error: participantsError } = await supabase
        .from('tournament_participants')
        .insert(participantInserts);

      if (participantsError) throw participantsError;

      toast.success(t("tournaments", "tournamentCreatedSuccess"));
      navigate("/profile?tab=competitions");
    } catch (error: any) {
      console.error("Error creating tournament:", error);
      toast.error(t("tournaments", "failedToCreate"));
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = !!formData.courseId;
  const canProceedStep2 = !!formData.name && !!formData.startDate && !!formData.startTime;
  const canSubmit = canProceedStep1 && canProceedStep2 && selectedParticipants.length > 0;

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
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t("tournaments", "createTournament")}</h1>
                <p className="text-xs text-muted-foreground">
                  {step === 1 ? "Selecciona el campo" : step === 2 ? "Detalles del torneo" : "Invita jugadores"}
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
                  s === step ? 'w-6 bg-amber-500' : s < step ? 'w-2 bg-amber-500' : 'w-2 bg-muted'
                }`}
                layoutId={`step-${s}`}
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
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 px-4">
                <div className="max-w-2xl mx-auto pb-32 space-y-3">
                  {coursesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
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
                            ? 'ring-2 ring-amber-500 scale-[1.02]'
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
                              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center"
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
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-[calc(1.5rem+var(--safe-area-bottom))] sm:pb-[calc(1.5rem+var(--safe-area-bottom))]">
                <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3 mb-2">
                  <Button
                    onClick={() => setShowExitConfirmation(true)}
                    variant="outline"
                    className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-medium sm:font-semibold text-sm sm:text-base px-3 sm:px-4"
                  >
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Mapa</span>
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium sm:font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 px-3 sm:px-4"
                  >
                    <span className="truncate">Continuar</span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2 flex-shrink-0" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tournament Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 pb-32 max-w-2xl mx-auto space-y-6">
                {/* Selected course preview */}
                {selectedCourse && (
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="relative h-24">
                      <img
                        src={selectedCourse.image_url || '/placeholder.svg'}
                        alt={selectedCourse.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                      <div className="absolute inset-0 flex items-center p-4">
                        <div>
                          <p className="text-amber-400 text-xs font-medium">Campo seleccionado</p>
                          <h3 className="font-semibold text-white">{selectedCourse.name}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("tournaments", "tournamentNameRequired")}</Label>
                    <Input
                      placeholder={t("tournaments", "tournamentNamePlaceholder")}
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("tournaments", "description")}</Label>
                    <Textarea
                      placeholder={t("tournaments", "descriptionPlaceholder")}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="min-h-[100px] rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      {t("tournaments", "tournamentDateRequired")}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500"
                      />
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange("startTime", e.target.value)}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500"
                        placeholder="Hora"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t("tournaments", "maxPlayers")}</Label>
                      <Input
                        type="number"
                        min="2"
                        max="32"
                        value={formData.maxPlayers}
                        onChange={(e) => handleInputChange("maxPlayers", parseInt(e.target.value))}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t("tournaments", "format")}</Label>
                      <Select
                        value={formData.tournamentType}
                        onValueChange={(value) => handleInputChange("tournamentType", value)}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-amber-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stroke_play">{t("tournaments", "strokePlay")}</SelectItem>
                          <SelectItem value="match_play">{t("tournaments", "matchPlay")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed bottom buttons - Two column layout */}
              <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-[calc(1.5rem+var(--safe-area-bottom))] sm:pb-[calc(1.5rem+var(--safe-area-bottom))]">
                <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3 mb-2">
                  <Button
                    onClick={() => setShowExitConfirmation(true)}
                    variant="outline"
                    className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-medium sm:font-semibold text-sm sm:text-base px-3 sm:px-4"
                  >
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Mapa</span>
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium sm:font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 px-3 sm:px-4"
                  >
                    <span className="truncate">Invitar</span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2 flex-shrink-0" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Participants */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 pb-32 max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-500" />
                    {t("tournaments", "selectParticipants")}
                  </h2>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0">
                    {selectedParticipants.length + 1}/{formData.maxPlayers}
                  </Badge>
                </div>

                {friends.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t("tournaments", "noFriendsAvailable")}</p>
                    <p className="text-sm">{t("tournaments", "addFriendsToInvite")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (selectedParticipants.includes(friend.id) || selectedParticipants.length + 1 < formData.maxPlayers) {
                            toggleParticipant(friend.id);
                          }
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                          selectedParticipants.includes(friend.id)
                            ? 'bg-amber-500/10 ring-1 ring-amber-500/30'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-background">
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback className="bg-amber-500/10 text-amber-600 font-semibold">
                              {friend.full_name?.charAt(0) || friend.username?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {friend.full_name || friend.username || 'Unknown User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{friend.username || 'user'}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedParticipants.includes(friend.id)}
                          onCheckedChange={() => toggleParticipant(friend.id)}
                          disabled={
                            !selectedParticipants.includes(friend.id) && 
                            selectedParticipants.length + 1 >= formData.maxPlayers
                          }
                          className="h-6 w-6 rounded-full border-2 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fixed bottom buttons - Two column layout */}
              <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-[calc(1.5rem+var(--safe-area-bottom))] sm:pb-[calc(1.5rem+var(--safe-area-bottom))]">
                <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3 mb-2">
                  <Button
                    onClick={() => setShowExitConfirmation(true)}
                    variant="outline"
                    className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl font-medium sm:font-semibold text-sm sm:text-base px-3 sm:px-4"
                  >
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Mapa</span>
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !canSubmit}
                    className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium sm:font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/25 px-3 sm:px-4"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span className="truncate">Creando</span>
                      </div>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Crear</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir al mapa?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderás el progreso del torneo que estás creando. ¿Estás seguro que deseas volver al mapa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExitToMap}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Sí, salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateTournament;