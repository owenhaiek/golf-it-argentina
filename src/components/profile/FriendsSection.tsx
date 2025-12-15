import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, UserMinus, Check, X, Clock } from "lucide-react";
import { useFriendsData } from "@/hooks/useFriendsData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const FriendsSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  
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
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'friends'
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span>{t("profile", "friends")} ({friends.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all relative ${
            activeTab === 'requests'
              ? 'bg-primary text-primary-foreground'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>{t("friends", "requests") || "Solicitudes"}</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {/* Loading State */}
          {(receivedRequestsLoading || sentRequestsLoading) && (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Received Requests */}
          {!receivedRequestsLoading && receivedRequests.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider px-1">
                {t("friends", "receivedRequests") || "Solicitudes recibidas"}
              </p>
              {receivedRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-primary/30">
                        <AvatarImage src={request.sender?.avatar_url} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-300">
                          {request.sender?.full_name?.charAt(0) || 
                           request.sender?.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-zinc-900" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {request.sender?.full_name || request.sender?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      onClick={() => acceptFriendRequest(request.id)}
                      disabled={acceptingFriendRequest}
                      className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-500"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => rejectFriendRequest(request.id)}
                      disabled={rejectingFriendRequest}
                      className="h-10 w-10 rounded-full bg-zinc-800 border-zinc-700 hover:bg-red-600 hover:border-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sent Requests */}
          {!sentRequestsLoading && sentRequests.length > 0 && (
            <div className="space-y-3 mt-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider px-1">
                {t("friends", "sentRequests") || "Solicitudes enviadas"}
              </p>
              {sentRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-zinc-700">
                      <AvatarImage src={request.receiver?.avatar_url} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400">
                        {request.receiver?.full_name?.charAt(0) || 
                         request.receiver?.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {request.receiver?.full_name || request.receiver?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-amber-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">{t("friends", "pending") || "Pendiente"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Requests */}
          {!receivedRequestsLoading && !sentRequestsLoading && 
           receivedRequests.length === 0 && sentRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">{t("friends", "noRequests") || "Sin solicitudes"}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {t("friends", "findFriends") || "Busca amigos para conectar"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friendsLoading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : friends.length > 0 ? (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div 
                  key={friend.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 group"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => navigate(`/user/${friend.id}`)}
                  >
                    <Avatar className="h-12 w-12 border-2 border-zinc-700 group-hover:border-primary/50 transition-colors">
                      <AvatarImage src={friend.avatar_url} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-300">
                        {friend.full_name?.charAt(0) || friend.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white group-hover:text-primary transition-colors">
                        {friend.full_name || friend.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        @{friend.username || 'user'}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={removingFriend}
                        className="h-10 w-10 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          {t("friends", "removeFriend") || "¿Eliminar amigo?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          {t("friends", "removeFriendDesc") || `Esto eliminará a ${friend.full_name || friend.username} de tu lista de amigos.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
                          {t("common", "cancel") || "Cancelar"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeFriend(friend.id)}
                          disabled={removingFriend}
                          className="bg-red-600 hover:bg-red-500"
                        >
                          {t("common", "confirm") || "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                <Users className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">{t("friends", "noFriends") || "Sin amigos aún"}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {t("friends", "startConnecting") || "Comienza a conectar con otros jugadores"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
