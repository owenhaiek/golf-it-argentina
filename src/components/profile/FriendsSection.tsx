import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserPlus, UserMinus, Check, X, Clock, Heart } from "lucide-react";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";

export const FriendsSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
            {/* Loading State */}
            {(receivedRequestsLoading || sentRequestsLoading) && (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-muted rounded" />
                      <div className="h-8 w-8 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Received Requests */}
            {!receivedRequestsLoading && receivedRequests.length > 0 && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Received Requests
                  </h4>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {receivedRequests.length} new
                  </Badge>
                </div>
                <ScrollArea className="max-h-48">
                  <div className="space-y-3">
                    {receivedRequests.map((request, index) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-200 animate-in slide-in-from-left-3"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                              <AvatarImage src={request.sender?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {request.sender?.full_name?.charAt(0) || 
                                 request.sender?.username?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {request.sender?.full_name || request.sender?.username || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptFriendRequest(request.id)}
                            disabled={acceptingFriendRequest}
                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectFriendRequest(request.id)}
                            disabled={rejectingFriendRequest}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
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
            {!sentRequestsLoading && sentRequests.length > 0 && (
              <>
                {receivedRequests.length > 0 && <Separator className="my-4" />}
                <div className="animate-in slide-in-from-top-2 duration-300 delay-150">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Sent Requests
                  </h4>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-3">
                      {sentRequests.map((request, index) => (
                        <div 
                          key={request.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-all duration-200 animate-in slide-in-from-right-3"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.receiver?.avatar_url} />
                              <AvatarFallback className="bg-muted">
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
                            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
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
            {!receivedRequestsLoading && !sentRequestsLoading && 
             receivedRequests.length === 0 && sentRequests.length === 0 && (
              <div className="text-center py-12 animate-in fade-in-50 duration-500">
                <div className="relative mb-4">
                  <UserPlus className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 rounded-full" />
                </div>
                <p className="text-muted-foreground font-medium">No pending friend requests</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                  Find friends by searching for players and sending them friend requests!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            {friendsLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-8 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : friends.length > 0 ? (
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Your Friends
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {friends.length} friend{friends.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {friends.map((friend, index) => (
                      <div 
                        key={friend.id} 
                        className="group flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-card to-card/50 hover:from-accent/30 hover:to-accent/10 transition-all duration-200 animate-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => navigate(`/user/${friend.id}`)}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                              <AvatarImage src={friend.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-medium">
                                {friend.full_name?.charAt(0) || 
                                 friend.username?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                              <Heart className="h-2 w-2 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                              {friend.full_name || friend.username || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Friends since {formatDistanceToNow(new Date(friend.friendship_created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFriend(friend.id);
                          }}
                          disabled={removingFriend}
                          className={`h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 ${
                            isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-12 animate-in fade-in-50 duration-500">
                <div className="relative mb-4">
                  <Users className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 rounded-full" />
                </div>
                <p className="text-muted-foreground font-medium">No friends yet</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                  Start by sending friend requests to other users! Search for players and connect with the golf community.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};