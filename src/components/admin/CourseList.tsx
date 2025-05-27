
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CourseListProps {
  onEditCourse: (course: GolfCourseTemplate) => void;
}

const CourseList = ({ onEditCourse }: CourseListProps) => {
  const [courses, setCourses] = useState<GolfCourseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
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
      
      console.log("Courses fetched:", data);
      setCourses(data || []);
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
      console.log(`Attempting to delete course with ID: ${id}`);
      
      // First, check if there are any related records and get counts
      const [roundsResult, reservationsResult, reviewsResult] = await Promise.all([
        supabase.from("rounds").select("id", { count: "exact" }).eq("course_id", id),
        supabase.from("reservations").select("id", { count: "exact" }).eq("course_id", id),
        supabase.from("course_reviews").select("id", { count: "exact" }).eq("course_id", id)
      ]);
      
      console.log("Related records found:", {
        rounds: roundsResult.count || 0,
        reservations: reservationsResult.count || 0,
        reviews: reviewsResult.count || 0
      });
      
      // Delete related records in order (most dependent first)
      if (roundsResult.count && roundsResult.count > 0) {
        console.log(`Deleting ${roundsResult.count} related rounds...`);
        const { error: deleteRoundsError } = await supabase
          .from("rounds")
          .delete()
          .eq("course_id", id);
        
        if (deleteRoundsError) {
          console.error("Error deleting related rounds:", deleteRoundsError);
          throw new Error(`Failed to delete related rounds: ${deleteRoundsError.message}`);
        }
        console.log("Successfully deleted related rounds");
      }
      
      if (reservationsResult.count && reservationsResult.count > 0) {
        console.log(`Deleting ${reservationsResult.count} related reservations...`);
        const { error: deleteReservationsError } = await supabase
          .from("reservations")
          .delete()
          .eq("course_id", id);
        
        if (deleteReservationsError) {
          console.error("Error deleting related reservations:", deleteReservationsError);
          throw new Error(`Failed to delete related reservations: ${deleteReservationsError.message}`);
        }
        console.log("Successfully deleted related reservations");
      }
      
      if (reviewsResult.count && reviewsResult.count > 0) {
        console.log(`Deleting ${reviewsResult.count} related reviews...`);
        const { error: deleteReviewsError } = await supabase
          .from("course_reviews")
          .delete()
          .eq("course_id", id);
        
        if (deleteReviewsError) {
          console.error("Error deleting related reviews:", deleteReviewsError);
          throw new Error(`Failed to delete related reviews: ${deleteReviewsError.message}`);
        }
        console.log("Successfully deleted related reviews");
      }
      
      // Finally delete the golf course
      console.log("Deleting golf course...");
      const { error: deleteCourseError } = await supabase
        .from("golf_courses")
        .delete()
        .eq("id", id);
      
      if (deleteCourseError) {
        console.error("Error deleting golf course:", deleteCourseError);
        throw new Error(`Failed to delete golf course: ${deleteCourseError.message}`);
      }
      
      console.log(`Successfully deleted course with ID: ${id}`);
      
      // Update UI by removing deleted course
      setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
      
      toast({
        title: "Éxito",
        description: "Campo de golf eliminado correctamente junto con todos sus registros relacionados",
      });
      
      // Refresh the course list to ensure it's up-to-date
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
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold">Lista de Campos de Golf</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar campos..." 
            className="pl-8"
            value={searchQuery} 
            onChange={handleSearchChange} 
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando campos de golf...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery 
            ? `No se encontraron campos de golf que coincidan con "${searchQuery}"` 
            : "No hay campos de golf registrados"}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Hoyos</TableHead>
                  <TableHead className="hidden md:table-cell">Par</TableHead>
                  <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.holes}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.par}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {course.address ? `${course.address}, ${course.state}` : course.state || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditCourse(course)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <AlertDialog 
                          open={openDialogId === course.id} 
                          onOpenChange={(open) => setOpenDialogId(open ? course.id : null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={deletingCourse === course.id}
                              className="bg-red-600 hover:bg-red-700 text-white"
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
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar Campo de Golf</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. ¿Estás seguro que deseas eliminar este campo de golf?
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                  <strong>Nota:</strong> Se eliminarán también todas las rondas, reservas y reseñas asociadas a este campo.
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setOpenDialogId(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => course.id && handleDeleteCourse(course.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </Card>
  );
};

export default CourseList;
