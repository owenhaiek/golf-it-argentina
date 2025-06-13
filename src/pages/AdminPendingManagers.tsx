
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Users,
  Clock,
  MapPin
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course_id: string;
  status: string;
  created_at: string;
  golf_courses: {
    name: string;
    city?: string;
    state?: string;
  };
}

const AdminPendingManagers = () => {
  const [pendingManagers, setPendingManagers] = useState<PendingManager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<PendingManager[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingManagers();
  }, []);

  useEffect(() => {
    filterManagers();
  }, [pendingManagers, searchTerm, statusFilter]);

  const fetchPendingManagers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("pending_course_managers")
        .select(`
          *,
          golf_courses (
            name,
            city,
            state
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching pending managers:", error);
        toast({
          title: "Error",
          description: "Failed to fetch pending managers.",
          variant: "destructive",
        });
        return;
      }

      setPendingManagers(data || []);
    } catch (error: any) {
      console.error("Error fetching pending managers:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch pending managers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterManagers = () => {
    let filtered = pendingManagers;

    if (searchTerm) {
      filtered = filtered.filter(manager => 
        manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.golf_courses.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(manager => manager.status === statusFilter);
    }

    setFilteredManagers(filtered);
  };

  const handleApprove = async (pendingId: string) => {
    try {
      setActionLoading(pendingId);
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (pendingId: string) => {
    try {
      setActionLoading(pendingId);
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
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingCount = pendingManagers.filter(m => m.status === 'pending').length;
  const approvedCount = pendingManagers.filter(m => m.status === 'approved').length;
  const rejectedCount = pendingManagers.filter(m => m.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading pending managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Course Manager Applications</h1>
              <p className="text-muted-foreground">Review and manage pending course manager registrations</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Check className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <X className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingManagers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications List */}
        {filteredManagers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching applications" : "No applications yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Course manager applications will appear here when submitted."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredManagers.map((manager) => (
              <Card key={manager.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-foreground mb-1">{manager.name}</CardTitle>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{manager.email}</span>
                          </div>
                          {manager.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{manager.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm font-medium">{manager.golf_courses.name}</span>
                          </div>
                          {(manager.golf_courses.city || manager.golf_courses.state) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">
                                {[manager.golf_courses.city, manager.golf_courses.state].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              Applied {new Date(manager.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(manager.status)}>
                      {manager.status.charAt(0).toUpperCase() + manager.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                {manager.status === 'pending' && (
                  <CardContent className="pt-0">
                    <div className="flex gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionLoading === manager.id}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Course Manager</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve {manager.name} as a course manager for {manager.golf_courses.name}? 
                              They will be able to manage reservations and access the course dashboard.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleApprove(manager.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve Manager
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={actionLoading === manager.id}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Application</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject {manager.name}'s application to manage {manager.golf_courses.name}? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleReject(manager.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject Application
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPendingManagers;
