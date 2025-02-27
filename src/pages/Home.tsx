
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Golf Courses</h1>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-40 bg-secondary/20 rounded-lg" />
                <div className="h-4 w-2/3 bg-secondary/20 rounded" />
                <div className="h-4 w-1/2 bg-secondary/20 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
