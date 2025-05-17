
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  address: string;
  state: string;
}

interface CourseListProps {
  onEditCourse: (course: Course) => void;
}

const CourseList = ({ onEditCourse }: CourseListProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
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
        .select("id, name, holes, par, address, state", { count: "exact" });
      
      if (query) {
        queryBuilder = queryBuilder.ilike("name", `%${query}%`);
      }
      
      const { data, count, error } = await queryBuilder
        .order("name")
        .range((page - 1) * coursesPerPage, page * coursesPerPage - 1);
      
      if (error) throw error;
      
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
        const { error } = await supabase.from("golf_courses").delete().eq("id", id);
        
        if (error) throw error;
        
        setCourses(courses.filter(course => course.id !== id));
        toast({
          title: "Éxito",
          description: "Campo de golf eliminado correctamente",
          variant: "default",
        });

        // If we deleted the last item on the page, go back a page
        if (courses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchCourses(currentPage, searchQuery);
        }
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
                          onClick={() => handleDeleteCourse(course.id)}
                          disabled={deletingCourse === course.id}
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
                
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
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
