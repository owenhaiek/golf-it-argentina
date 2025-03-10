
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route } from "lucide-react";

const Roadmap = () => {
  const roadmapFeatures = [
    {
      title: "Shot Tracking",
      description: "Track individual shots during your round with distance, club selection and accuracy metrics.",
      status: "Coming Soon",
      icon: "🎯",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Performance Analytics",
      description: "Advanced statistics and performance insights with personalized improvement suggestions.",
      status: "In Development",
      icon: "📊",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Social Features",
      description: "Connect with friends, share rounds, and compare scores on leaderboards.",
      status: "Planned",
      icon: "👥",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Tournament Organization",
      description: "Create and manage golf tournaments with your friends or community.",
      status: "Future",
      icon: "🏆",
      color: "bg-amber-100 text-amber-800"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Route className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Future Roadmap</h1>
      </div>

      <p className="text-muted-foreground">
        We're constantly working to improve GolfTracker and add new features to help you track your progress and enjoy the game.
      </p>

      <div className="grid grid-cols-1 gap-6 mt-6">
        {roadmapFeatures.map((feature, index) => (
          <Card key={index} className="overflow-hidden border-l-4" style={{ borderLeftColor: feature.color.split(' ')[1] }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
                <Badge className={feature.color}>{feature.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-foreground/80">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 p-4 rounded-lg mt-4">
        <h3 className="font-medium mb-2">Have a feature suggestion?</h3>
        <p className="text-sm text-muted-foreground">
          We'd love to hear your ideas on how to make GolfTracker even better! 
          Contact us with your suggestions.
        </p>
      </div>
    </div>
  );
};

export default Roadmap;
