import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  Users,
  Clock,
  MapPin,
  ArrowLeft,
  List,
  Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
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
import { motion } from "framer-motion";

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
  const navigate = useNavigate();

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
          golf_courses (name, city, state)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los managers pendientes.",
          variant: "destructive",
        });
        return;
      }

      setPendingManagers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los managers pendientes.",
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
      const { data, error } = await supabase.rpc("approve_course_manager", {
        pending_id: pendingId,
      });

      if (error) {
        // Handle duplicate email error
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          toast({
            title: "Ya existe",
            description: "Este manager ya está registrado. Puedes eliminar la solicitud pendiente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "No se pudo aprobar el manager.",
            variant: "destructive",
          });
        }
      } else if (data === false) {
        toast({
          title: "Error",
          description: "No se encontró la solicitud pendiente o ya fue procesada.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Manager aprobado exitosamente.",
        });
        fetchPendingManagers();
      }
    } catch (error: any) {
      // Handle duplicate email error from catch
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        toast({
          title: "Ya existe",
          description: "Este manager ya está registrado. Puedes eliminar la solicitud pendiente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo aprobar el manager.",
          variant: "destructive",
        });
      }
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
        toast({
          title: "Error",
          description: "No se pudo rechazar el manager.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Manager rechazado exitosamente.",
        });
        fetchPendingManagers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar el manager.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (pendingId: string) => {
    try {
      setActionLoading(pendingId);
      const { error } = await supabase
        .from('pending_course_managers')
        .delete()
        .eq('id', pendingId);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el registro.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: "Registro eliminado exitosamente.",
        });
        fetchPendingManagers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el registro.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Aprobado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rechazado</Badge>;
      default:
        return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">{status}</Badge>;
    }
  };

  const pendingCount = pendingManagers.filter(m => m.status === 'pending').length;
  const approvedCount = pendingManagers.filter(m => m.status === 'approved').length;
  const rejectedCount = pendingManagers.filter(m => m.status === 'rejected').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400">Cargando solicitudes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 via-zinc-950 to-zinc-950 fixed" />
      
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/course-edit-list')}
              className="flex items-center gap-2 bg-zinc-900/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
            >
              <List className="h-4 w-4" />
              Ver Campos
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Solicitudes de Managers</h1>
              <p className="text-zinc-500 text-sm">Revisar y gestionar registros pendientes</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Clock, count: pendingCount, label: 'Pendientes', color: 'text-yellow-400' },
              { icon: Check, count: approvedCount, label: 'Aprobados', color: 'text-emerald-400' },
              { icon: X, count: rejectedCount, label: 'Rechazados', color: 'text-red-400' },
              { icon: Users, count: pendingManagers.length, label: 'Total', color: 'text-blue-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.count}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o campo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-zinc-900/50 border-zinc-700/50 text-white placeholder:text-zinc-500 rounded-xl focus:border-emerald-500/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 bg-zinc-900/50 border-zinc-700/50 text-white rounded-xl">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all" className="text-white">Todos</SelectItem>
                <SelectItem value="pending" className="text-white">Pendientes</SelectItem>
                <SelectItem value="approved" className="text-white">Aprobados</SelectItem>
                <SelectItem value="rejected" className="text-white">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Applications List */}
        {filteredManagers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-12 border border-zinc-800/50 text-center"
          >
            <Building2 className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-400 mb-2">
              {searchTerm || statusFilter !== "all" ? "No hay resultados" : "Sin solicitudes"}
            </h3>
            <p className="text-sm text-zinc-600">
              {searchTerm || statusFilter !== "all" 
                ? "Intenta ajustar los filtros de búsqueda." 
                : "Las solicitudes de managers aparecerán aquí."
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredManagers.map((manager, index) => (
              <motion.div 
                key={manager.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-5 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">{manager.name}</h3>
                        {getStatusBadge(manager.status)}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{manager.email}</span>
                        </div>
                        {manager.phone && (
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{manager.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium text-zinc-300">{manager.golf_courses.name}</span>
                        </div>
                        {(manager.golf_courses.city || manager.golf_courses.state) && (
                          <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {[manager.golf_courses.city, manager.golf_courses.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {new Date(manager.created_at).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    {manager.status === 'pending' && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                              disabled={actionLoading === manager.id}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-900 border-zinc-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Aprobar Manager</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-400">
                                ¿Estás seguro de aprobar a {manager.name} como manager de {manager.golf_courses.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleApprove(manager.id)}
                                className="bg-emerald-600 hover:bg-emerald-500"
                              >
                                Aprobar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              className="rounded-lg"
                              disabled={actionLoading === manager.id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-900 border-zinc-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Rechazar Solicitud</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-400">
                                ¿Estás seguro de rechazar la solicitud de {manager.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleReject(manager.id)}
                                className="bg-red-600 hover:bg-red-500"
                              >
                                Rechazar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {/* Delete button - available for all statuses */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-lg border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                          disabled={actionLoading === manager.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Eliminar Registro</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            ¿Estás seguro de eliminar permanentemente el registro de {manager.name}? Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(manager.id)}
                            className="bg-red-600 hover:bg-red-500"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPendingManagers;
