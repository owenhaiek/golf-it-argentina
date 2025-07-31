import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserPlus, UserMinus, Check, X, Clock } from "lucide-react";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";

export const FriendsSection = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'requests' | 'friends'>('requests');
  
  const {
    receivedRequests,
    sentRequests,
    friends,
    receivedRequestsLoading,
    sentRequestsLoading,
    friendsLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    acceptingFriendRequest,
    rejectingFriendRequest,
    removingFriend
  } = useFriendsData();

  const pendingRequestsCount = receivedRequests.length;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Friends
        </CardTitle>
        
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('requests')}
            className="flex items-center gap-2"
            size="sm"
          >
            <UserPlus className="h-4 w-4" />
            Requests
            {pendingRequestsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingRequestsCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'friends' ? 'default' : 'outline'}
            onClick={() => setActiveTab('friends')}
            className="flex items-center gap-2"
            size="sm"
          >
            <Users className="h-4 w-4" />
            Friends ({friends.length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Received Requests */}
            {receivedRequests.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Received Requests
                </h4>
                <ScrollArea className="max-h-48">
                  <div className="space-y-3">
                    {receivedRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.sender?.avatar_url} />
                            <AvatarFallback>
                              {request.sender?.full_name?.charAt(0) || 
                               request.sender?.username?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {request.sender?.full_name || request.sender?.username || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.id)}
                            disabled={acceptingFriendRequest}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectFriendRequest(request.id)}
                            disabled={rejectingFriendRequest}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <>
                {receivedRequests.length > 0 && <Separator />}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Sent Requests
                  </h4>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-3">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.receiver?.avatar_url} />
                              <AvatarFallback>
                                {request.receiver?.full_name?.charAt(0) || 
                                 request.receiver?.username?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {request.receiver?.full_name || request.receiver?.username || 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Pending</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}

            {/* No Requests */}
            {receivedRequests.length === 0 && sentRequests.length === 0 && (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pending friend requests</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            {friends.length > 0 ? (
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.full_name?.charAt(0) || 
                             friend.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {friend.full_name || friend.username || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Friends since {formatDistanceToNow(new Date(friend.friendship_created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFriend(friend.id)}
                        disabled={removingFriend}
                        className="h-8 w-8 p-0"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No friends yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start by sending friend requests to other users!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};