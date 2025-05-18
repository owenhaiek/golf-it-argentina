
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { GolfCourseTemplate } from "@/pages/AdminGolfCourseManager";
import { OpeningHours } from "@/lib/supabase";

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  address: string;
  state: string;
}

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
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este campo de golf?")) {
      setDeletingCourse(id);
      try {
        console.log(`Attempting to delete course with ID: ${id}`);
        
        // Check if there are related records in the rounds table
        const { data: relatedRounds, error: roundsError } = await supabase
          .from("rounds")
          .select("id")
          .eq("course_id", id);
          
        if (roundsError) throw roundsError;
        
        // Check if there are related reservations
        const { data: relatedReservations, error: reservationsError } = await supabase
          .from("reservations")
          .select("id")
          .eq("course_id", id);
          
        if (reservationsError) throw reservationsError;
        
        // If there are related records, prompt the user
        if ((relatedRounds && relatedRounds.length > 0) || 
            (relatedReservations && relatedReservations.length > 0)) {
          const hasRounds = relatedRounds && relatedRounds.length > 0;
          const hasReservations = relatedReservations && relatedReservations.length > 0;
          
          let warningMessage = "Este campo de golf tiene ";
          if (hasRounds) warningMessage += `${relatedRounds.length} ronda(s)`;
          if (hasRounds && hasReservations) warningMessage += " y ";
          if (hasReservations) warningMessage += `${relatedReservations.length} reserva(s)`;
          warningMessage += " asociadas. Si lo elimina, se eliminarán también estos datos. ¿Desea continuar?";
          
          if (!window.confirm(warningMessage)) {
            setDeletingCourse(null);
            return;
          }
          
          // Delete related rounds
          if (hasRounds) {
            const { error: deleteRoundsError } = await supabase
              .from("rounds")
              .delete()
              .eq("course_id", id);
              
            if (deleteRoundsError) throw deleteRoundsError;
          }
          
          // Delete related reservations
          if (hasReservations) {
            const { error: deleteReservationsError } = await supabase
              .from("reservations")
              .delete()
              .eq("course_id", id);
              
            if (deleteReservationsError) throw deleteReservationsError;
          }
        }
        
        // Now delete the course
        const { error } = await supabase
          .from("golf_courses")
          .delete()
          .eq("id", id);
        
        if (error) {
          console.error("Error from delete operation:", error);
          throw error;
        }
        
        console.log(`Successfully deleted course with ID: ${id}`);
        
        // Update local state to reflect the deletion
        setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
        
        toast({
          title: "Éxito",
          description: "Campo de golf eliminado correctamente",
          variant: "default",
        });

        // Force refetch courses instead of trying to manage state manually
        fetchCourses(currentPage, searchQuery);
      } catch (error: any) {
        console.error("Error deleting course:", error);
        toast({
          title: "Error",
          description: `No se pudo eliminar el campo: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setDeletingCourse(null);
      }
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
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id || '')}
                          disabled={deletingCourse === course.id}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">
                            {deletingCourse === course.id ? "Eliminando..." : "Eliminar"}
                          </span>
                        </Button>
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
