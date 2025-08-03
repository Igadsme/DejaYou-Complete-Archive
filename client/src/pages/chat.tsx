import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ArrowLeft, 
  Send, 
  Shield, 
  MessageCircle, 
  Lightbulb,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [showConsentRequest, setShowConsentRequest] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['/api/matches', matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const matches = await queryClient.fetchQuery({
        queryKey: ['/api/matches']
      });
      return (matches as any[]).find((m: any) => m.id === matchId);
    }
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ['/api/matches', matchId, 'messages'],
    enabled: !!matchId,
    refetchInterval: 5000, // Poll for new messages
  });

  const { data: conversationStarters = [] } = useQuery<any[]>({
    queryKey: ['/api/matches', matchId, 'conversation-starters'],
    enabled: !!matchId,
  });

  const { data: sharedEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/matches', matchId, 'shared-events'],
    enabled: !!matchId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      await apiRequest('POST', `/api/matches/${matchId}/messages`, messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches', matchId, 'messages'] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message,
      isConsentRequest: showConsentRequest,
    });
  };

  const handleUseStarter = (starter: string) => {
    setMessage(starter);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (matchLoading || messagesLoading || !match) {
    return (
      <div className="min-h-screen bg-lightbg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-coral-sunset rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-white animate-pulse" />
          </div>
          <p className="text-darktext/70">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const otherUser = match.otherUser;

  return (
    <div className="min-h-screen bg-lightbg flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-softgray">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/matches">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Matches
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 gradient-coral-teal rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {otherUser?.firstName?.[0] || '?'}
                  </span>
                </div>
                <div>
                  <h1 className="font-handwritten text-xl font-bold text-darktext">
                    {otherUser?.firstName}
                  </h1>
                  <p className="text-sm text-darktext/70">
                    {sharedEvents.length} shared experience{sharedEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-coral/10 text-coral">
                {match.dejaScore}% Match
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col shadow-warm">
            <CardHeader className="border-b border-softgray">
              <CardTitle className="flex items-center text-darktext">
                <MessageCircle className="w-5 h-5 mr-2 text-coral" />
                Conversation
              </CardTitle>
            </CardHeader>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-coral/50" />
                    </div>
                    <h3 className="font-handwritten text-xl font-bold text-darktext mb-2">
                      Start your conversation
                    </h3>
                    <p className="text-darktext/70 text-sm mb-4">
                      You both have shared experiences. Share your stories and connect.
                    </p>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === (user as any)?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          msg.senderId === (user as any)?.id
                            ? 'gradient-coral-sunset text-white'
                            : 'bg-white border border-softgray text-darktext'
                        }`}
                      >
                        {msg.isConsentRequest && (
                          <div className="flex items-center text-xs mb-2 opacity-80">
                            <Shield className="w-3 h-3 mr-1" />
                            Sensitive content request
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {msg.senderId === (user as any)?.id && (
                            <CheckCircle className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-softgray">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  {showConsentRequest && (
                    <div className="flex items-center mt-2 p-2 bg-sunset/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-sunset mr-2" />
                      <span className="text-xs text-darktext/80">
                        This message requests access to sensitive content
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConsentRequest(false)}
                        className="ml-auto"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => setShowConsentRequest(!showConsentRequest)}
                    variant={showConsentRequest ? "default" : "outline"}
                    size="sm"
                    className={showConsentRequest ? "bg-sunset text-white" : ""}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="gradient-coral-sunset text-white"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conversation Starters */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center text-darktext text-sm">
                <Lightbulb className="w-4 h-4 mr-2 text-sunset" />
                Conversation Starters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversationStarters.length === 0 ? (
                <p className="text-sm text-darktext/70 text-center py-4">
                  No conversation starters available yet
                </p>
              ) : (
                <div className="space-y-2">
                  {conversationStarters.map((starter: any) => (
                    <button
                      key={starter.id}
                      onClick={() => handleUseStarter(starter.question)}
                      className="w-full text-left p-3 rounded-lg bg-sunset/10 hover:bg-sunset/20 transition-colors"
                    >
                      <p className="text-sm text-darktext/80">{starter.question}</p>
                      {starter.basedOnEvent && (
                        <p className="text-xs text-darktext/60 mt-1">
                          Based on: {starter.basedOnEvent.replace('_', ' ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shared Experiences Summary */}
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center text-darktext text-sm">
                <Heart className="w-4 h-4 mr-2 text-coral" />
                Your Shared Chapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sharedEvents.length === 0 ? (
                <p className="text-sm text-darktext/70 text-center py-4">
                  Shared experiences will appear here
                </p>
              ) : (
                <div className="space-y-3">
                  {sharedEvents.slice(0, 3).map((event: any, index: number) => (
                    <div key={event.id} className="p-3 bg-coral/5 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-coral' : index === 1 ? 'bg-teal' : 'bg-sunset'
                        }`}></div>
                        <p className="text-sm font-medium text-darktext">
                          Similar Experience
                        </p>
                      </div>
                      <p className="text-xs text-darktext/70">
                        {event.similarityScore}% similarity
                      </p>
                    </div>
                  ))}
                  {sharedEvents.length > 3 && (
                    <p className="text-xs text-center text-darktext/60">
                      +{sharedEvents.length - 3} more shared experiences
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <Card className="border-sunset/30 bg-sunset/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-sunset mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-darktext mb-1">
                    Emotional Safety
                  </p>
                  <p className="text-xs text-darktext/70">
                    Use the shield button to request consent before sharing sensitive content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
