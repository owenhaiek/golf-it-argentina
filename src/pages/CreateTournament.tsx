import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useGolfCourses } from "@/hooks/useGolfCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Users, Calendar, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const CreateTournament = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends } = useFriendsData();
  const { courses } = useGolfCourses("", {
    location: "",
    holes: "",
    favoritesOnly: false,
    isOpen: false,
    minRating: 0
  });
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    courseId: "",
    startDate: "",
    endDate: "",
    maxPlayers: 8,
    entryFee: 0,
    prizePool: 0,
    tournamentType: "stroke_play"
  });
  
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create tournament
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          description: formData.description,
          course_id: formData.courseId,
          creator_id: user.id,
          start_date: formData.startDate,
          end_date: formData.endDate || formData.startDate,
          max_players: formData.maxPlayers,
          entry_fee: formData.entryFee,
          prize_pool: formData.prizePool,
          tournament_type: formData.tournamentType
        })
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      // Add creator as participant
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

      toast.success("Tournament created successfully!");
      navigate("/home");
    } catch (error: any) {
      console.error("Error creating tournament:", error);
      toast.error("Failed to create tournament");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Create Tournament</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Friends Championship"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tournament description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="course">Golf Course *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => handleInputChange("courseId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a golf course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {course.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min="2"
                    max="32"
                    value={formData.maxPlayers}
                    onChange={(e) => handleInputChange("maxPlayers", parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="tournamentType">Format</Label>
                  <Select
                    value={formData.tournamentType}
                    onValueChange={(value) => handleInputChange("tournamentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stroke_play">Stroke Play</SelectItem>
                      <SelectItem value="match_play">Match Play</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entryFee">Entry Fee ($)</Label>
                  <Input
                    id="entryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.entryFee}
                    onChange={(e) => handleInputChange("entryFee", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="prizePool">Prize Pool ($)</Label>
                  <Input
                    id="prizePool"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.prizePool}
                    onChange={(e) => handleInputChange("prizePool", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Participants
                </div>
                <Badge variant="secondary">
                  {selectedParticipants.length + 1}/{formData.maxPlayers}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No friends available</p>
                  <p className="text-sm">Add friends to invite them to tournaments</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
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
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.courseId || selectedParticipants.length === 0}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            {isLoading ? "Creating Tournament..." : "Create Tournament"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTournament;