import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminPendingManagers = () => {
  const [pendingManagers, setPendingManagers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingManagers();
  }, []);

  const fetchPendingManagers = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_course_managers")
        .select("*");

      if (error) {
        console.error("Error fetching pending managers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch pending managers.",
          variant: "destructive",
        });
      }

      setPendingManagers(data || []);
    } catch (error: any) {
      console.error("Error fetching pending managers:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch pending managers.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (pendingId: string) => {
    try {
      const { error } = await supabase.rpc("approve_course_manager", {
        pending_id: pendingId,
      });

      if (error) {
        console.error("Error approving manager:", error);
        toast({
          title: "Error",
          description: "Failed to approve manager.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Manager approved successfully.",
        });
        fetchPendingManagers();
      }
    } catch (error: any) {
      console.error("Error approving manager:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve manager.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (pendingId: string) => {
    try {
      const { error } = await supabase.rpc("reject_course_manager", {
        pending_id: pendingId,
      });

      if (error) {
        console.error("Error rejecting manager:", error);
        toast({
          title: "Error",
          description: "Failed to reject manager.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Manager rejected successfully.",
        });
        fetchPendingManagers();
      }
    } catch (error: any) {
      console.error("Error rejecting manager:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject manager.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Course Managers</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingManagers.length === 0 ? (
          <p>No pending course managers.</p>
        ) : (
          <div className="grid gap-4">
            {pendingManagers.map((manager) => (
              <Card key={manager.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{manager.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {manager.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(manager.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(manager.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPendingManagers;
