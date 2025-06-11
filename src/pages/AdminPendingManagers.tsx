import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Building2, 
  Mail, 
  Phone, 
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface PendingManager {
  id: string;
  course_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  status: string;
  golf_courses: {
    name: string;
    city: string | null;
    state: string | null;
  };
}

const AdminPendingManagers = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingManagers, isLoading } = useQuery({
    queryKey: ['pendingManagers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pending_course_managers')
        .select(`
          *,
          golf_courses (
            name,
            city,
            state
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Pending managers fetch error:", error);
        throw error;
      }
      return data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (pendingId: string) => {
      console.log("Starting approval process for pending ID:", pendingId);
      
      // Get the pending manager details first
      const { data: pendingManager, error: fetchError } = await supabase
        .from('pending_course_managers')
        .select('*')
        .eq('id', pendingId)
        .eq('status', 'pending')
        .single();
      
      if (fetchError || !pendingManager) {
        console.error("Error fetching pending manager:", fetchError);
        throw new Error("Pending manager not found");
      }
      
      console.log("Found pending manager:", pendingManager);
      
      // Insert into course_managers table directly
      const { data: newManager, error: insertError } = await supabase
        .from('course_managers')
        .insert({
          course_id: pendingManager.course_id,
          name: pendingManager.name,
          email: pendingManager.email,
          password_hash: pendingManager.password_hash,
          phone: pendingManager.phone,
          is_active: true
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating course manager:", insertError);
        throw insertError;
      }
      
      console.log("Created course manager:", newManager);
      
      // Update the pending record status
      const { error: updateError } = await supabase
        .from('pending_course_managers')
        .update({ status: 'approved' })
        .eq('id', pendingId);
      
      if (updateError) {
        console.error("Error updating pending status:", updateError);
        throw updateError;
      }
      
      console.log("Approval process completed successfully");
      return newManager;
    },
    onSuccess: () => {
      toast({
        title: "Manager Approved",
        description: "The course manager has been approved and can now log in.",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingManagers'] });
    },
    onError: (error: any) => {
      console.error("Approval failed:", error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to approve manager",
      });
    },
    onSettled: () => {
      setProcessingId(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (pendingId: string) => {
      const { data, error } = await supabase
        .rpc('reject_course_manager', { pending_id: pendingId });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Manager Rejected",
        description: "The course manager application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['pendingManagers'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "Failed to reject manager",
      });
    },
    onSettled: () => {
      setProcessingId(null);
    }
  });

  const handleApprove = (pendingId: string) => {
    setProcessingId(pendingId);
    approveMutation.mutate(pendingId);
  };

  const handleReject = (pendingId: string) => {
    setProcessingId(pendingId);
    rejectMutation.mutate(pendingId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pending Course Manager Applications</h1>
        <p className="text-muted-foreground">Review and approve course manager registrations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : pendingManagers && pendingManagers.length > 0 ? (
        <div className="space-y-4">
          {pendingManagers.map((manager: PendingManager) => (
            <Card key={manager.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {manager.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {manager.golf_courses.name}
                      {manager.golf_courses.city && ` - ${manager.golf_courses.city}`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{manager.email}</span>
                    </div>
                    {manager.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{manager.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Applied on {format(new Date(manager.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3">
                    <Button
                      onClick={() => handleApprove(manager.id)}
                      disabled={processingId === manager.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === manager.id && approveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(manager.id)}
                      disabled={processingId === manager.id}
                    >
                      {processingId === manager.id && rejectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No pending course manager applications.
        </div>
      )}
    </div>
  );
};

export default AdminPendingManagers;
