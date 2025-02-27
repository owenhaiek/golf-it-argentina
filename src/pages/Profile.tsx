
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Profile = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center pb-2">
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">John Doe</CardTitle>
          <p className="text-sm text-muted-foreground">Handicap: 12</p>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" className="mt-2">Edit Profile</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          No rounds recorded yet
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
