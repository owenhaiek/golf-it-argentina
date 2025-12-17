import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, Search, Loader2, MapPin, Flag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface GolfCourse {
  id?: string;
  name: string;
  city?: string;
  state?: string;
  par?: number;
  holes: number;
  description?: string;
  image_url?: string;
  address?: string;
  phone?: string;
  website?: string;
  opening_hours?: any;
  hole_pars?: number[];
  hole_handicaps?: number[];
  image_gallery?: string;
  created_at?: string;
  updated_at?: string;
}

interface CourseListProps {
  onEditCourse: (course: GolfCourse) => void;
}

const CourseList = ({ onEditCourse }: CourseListProps) => {
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const { toast } = useToast();
  const coursesPerPage = 10;

  const fetchCourses = async (page: number, query: string = '') => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from("golf_courses")
        .select("*", { count: "exact" });
      
      if (query) {
        queryBuilder = queryBuilder.ilike("name", `%${query}%`);
      }
      
      const { data, count, error } = await queryBuilder
        .order("name")
        .range((page - 1) * coursesPerPage, page * coursesPerPage - 1);
      
      if (error) throw error;
      
      setCourses((data as GolfCourse[]) || []);
      setTotalCourses(count || 0);
      setTotalPages(count ? Math.ceil(count / coursesPerPage) : 1);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los campos de golf: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteCourse = async (id: string) => {
    if (deletingCourse) return;
    
    setDeletingCourse(id);
    setOpenDialogId(null);
    
    try {
      const { data: existingCourse, error: fetchError } = await supabase
        .from("golf_courses")
        .select('id, name')
        .eq('id', id)
        .maybeSingle();
      
      if (fetchError) throw new Error(`Failed to verify course: ${fetchError.message}`);
      if (!existingCourse) throw new Error("Course not found");
      
      const { error: deleteRoundsError } = await supabase
        .from("rounds")
        .delete()
        .eq("course_id", id);
      
      if (deleteRoundsError) throw new Error(`Failed to delete related rounds: ${deleteRoundsError.message}`);
      
      const { error: deleteReservationsError } = await supabase
        .from("reservations")
        .delete()
        .eq("course_id", id);
      
      if (deleteReservationsError) throw new Error(`Failed to delete related reservations: ${deleteReservationsError.message}`);
      
      const { error: deleteReviewsError } = await supabase
        .from("course_reviews")
        .delete()
        .eq("course_id", id);
      
      if (deleteReviewsError) throw new Error(`Failed to delete related reviews: ${deleteReviewsError.message}`);
      
      const { error: deleteCourseError } = await supabase
        .from("golf_courses")
        .delete()
        .eq("id", id);
      
      if (deleteCourseError) throw new Error(`Failed to delete golf course: ${deleteCourseError.message}`);
      
      setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
      
      toast({
        title: "Éxito",
        description: `Campo de golf "${existingCourse.name}" eliminado correctamente`,
      });
      
      await fetchCourses(currentPage, searchQuery);
      
    } catch (error: any) {
      console.error("Error in deletion process:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el campo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeletingCourse(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Flag className="h-5 w-5 text-green-500" />
                Lista de Campos de Golf
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {totalCourses} campos registrados
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Buscar campos..." 
                className="pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-green-500/50 focus:ring-green-500/20"
                value={searchQuery} 
                onChange={handleSearchChange} 
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-4" />
              <p className="text-zinc-400">Cargando campos de golf...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">
                {searchQuery 
                  ? `No se encontraron campos que coincidan con "${searchQuery}"` 
                  : "No hay campos de golf registrados"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800/50 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-medium">Nombre</TableHead>
                      <TableHead className="text-zinc-400 font-medium hidden md:table-cell">Hoyos</TableHead>
                      <TableHead className="text-zinc-400 font-medium hidden md:table-cell">Par</TableHead>
                      <TableHead className="text-zinc-400 font-medium hidden lg:table-cell">Ubicación</TableHead>
                      <TableHead className="text-zinc-400 font-medium text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {courses.map((course, index) => (
                        <motion.tr
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                        >
                          <TableCell className="font-medium text-white">{course.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              {course.holes} hoyos
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-zinc-300">
                            Par {course.par || '-'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="text-sm">
                                {course.city || course.state || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onEditCourse(course)}
                                className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white hover:border-zinc-600"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Editar</span>
                              </Button>
                              <AlertDialog 
                                open={openDialogId === course.id} 
                                onOpenChange={(open) => setOpenDialogId(open ? course.id || null : null)}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    disabled={deletingCourse === course.id}
                                    className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                                  >
                                    {deletingCourse === course.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        <span className="hidden sm:inline">Eliminando...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        <span className="hidden sm:inline">Eliminar</span>
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Eliminar Campo de Golf</AlertDialogTitle>
                                    <AlertDialogDescription className="text-zinc-400">
                                      Esta acción no se puede deshacer. ¿Estás seguro que deseas eliminar el campo "{course.name}"?
                                      <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400">
                                        <strong>Nota:</strong> Se eliminarán también todas las rondas, reservas y reseñas asociadas a este campo.
                                      </div>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel 
                                      onClick={() => setOpenDialogId(null)}
                                      className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
                                    >
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => course.id && handleDeleteCourse(course.id)}
                                      className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                                      disabled={deletingCourse === course.id}
                                    >
                                      {deletingCourse === course.id ? "Eliminando..." : "Eliminar"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={`bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              isActive={currentPage === pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={currentPage === pageNum 
                                ? "bg-green-500/20 border-green-500/30 text-green-400" 
                                : "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white cursor-pointer"
                              }
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={`bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseList;
