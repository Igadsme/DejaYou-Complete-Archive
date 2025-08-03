import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  MessageCircle, 
  Heart, 
  Lightbulb,
  Calendar,
  Shield,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface SharedChaptersProps {
  match: any;
  sharedEvents: any[];
}

export default function SharedChapters({ match, sharedEvents }: SharedChaptersProps) {
  const { data: conversationStarters = [] } = useQuery<any[]>({
    queryKey: ['/api/matches', match.id, 'conversation-starters'],
    enabled: !!match,
  });

  const otherUser = match.otherUser;
  const groupedSharedEvents = sharedEvents.reduce((acc: any, event: any) => {
    const category = event.user1Event?.category || event.user2Event?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(event);
    return acc;
  }, {});

  const categoryLabels: { [key: string]: string } = {
    formative: 'Formative Years',
    turning_points: 'Turning Points',
    growth: 'Growth Journey',
  };

  const categoryColors: { [key: string]: string } = {
    formative: 'coral',
    turning_points: 'teal',
    growth: 'sunset',
  };

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle className="flex items-center text-darktext">
          <BookOpen className="w-5 h-5 mr-2 text-coral" />
          Shared Chapters
        </CardTitle>
        <p className="text-sm text-darktext/70">
          Your connection with {otherUser?.firstName}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Match Summary */}
        <div className="text-center p-4 bg-gradient-to-r from-coral/5 via-teal/5 to-sunset/5 rounded-lg">
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="w-12 h-12 gradient-coral-teal rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {otherUser?.firstName?.[0] || '?'}
              </span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-coral to-teal rounded-full flex items-center justify-center">
              <Heart className="text-white w-4 h-4" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-coral/20 to-teal/20 rounded-full flex items-center justify-center">
              <span className="text-darktext font-medium text-sm">You</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 text-center">
            <div>
              <div className="text-lg font-bold text-coral">{match.dejaScore}%</div>
              <div className="text-xs text-darktext/60">Match Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-teal">{sharedEvents.length}</div>
              <div className="text-xs text-darktext/60">Shared Events</div>
            </div>
          </div>
        </div>

        {/* Shared Events by Category */}
        {sharedEvents.length > 0 ? (
          <div>
            <h4 className="font-medium text-darktext mb-4 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-sunset" />
              Your Similar Experiences
            </h4>
            
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {Object.entries(groupedSharedEvents).map(([category, events]: [string, any]) => (
                  <div key={category}>
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 bg-${categoryColors[category] || 'darktext'}`}></div>
                      <span className="text-sm font-medium text-darktext">
                        {categoryLabels[category] || category}
                      </span>
                    </div>
                    
                    <div className="space-y-2 ml-5">
                      {events.map((event: any) => (
                        <div key={event.id} className={`p-3 rounded-lg border-l-4 border-${categoryColors[category] || 'darktext'} bg-${categoryColors[category] || 'darktext'}/5`}>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-darktext/60 font-medium">Your experience:</p>
                              <p className="text-sm text-darktext">
                                {event.user1Event?.customTitle || event.user1Event?.lifeEvent?.title}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-darktext/60 font-medium">{otherUser?.firstName}'s experience:</p>
                              <p className="text-sm text-darktext">
                                {event.user2Event?.customTitle || event.user2Event?.lifeEvent?.title}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs bg-coral/20 text-coral">
                                {event.similarityScore}% similar
                              </Badge>
                              {(event.user1Event?.isSensitive || event.user2Event?.isSensitive) && (
                                <Shield className="w-3 h-3 text-sunset" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-coral/50" />
            </div>
            <p className="text-darktext/70 text-sm">
              Shared experiences will appear here once you both relate to each other
            </p>
          </div>
        )}

        {/* Conversation Starters */}
        {conversationStarters.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-darktext mb-4 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-sunset" />
                Start a Conversation
              </h4>
              
              <div className="space-y-2">
                {conversationStarters.slice(0, 3).map((starter: any) => (
                  <div
                    key={starter.id}
                    className="p-3 rounded-lg bg-sunset/10 hover:bg-sunset/20 transition-colors cursor-pointer"
                  >
                    <p className="text-sm text-darktext/80">"{starter.question}"</p>
                    {starter.basedOnEvent && (
                      <p className="text-xs text-darktext/60 mt-1">
                        Based on: {starter.basedOnEvent.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/chat/${match.id}`}>
            <Button className="w-full gradient-coral-sunset text-white hover:shadow-warm transition-shadow">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Conversation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          {sharedEvents.length > 0 && (
            <Button variant="outline" className="w-full text-sm">
              <Heart className="w-4 h-4 mr-2" />
              View All {sharedEvents.length} Shared Experiences
            </Button>
          )}
        </div>

        {/* Connection Insights */}
        <div className="text-center p-4 bg-lightbg rounded-lg">
          <p className="text-xs text-darktext/70 leading-relaxed">
            You both have walked similar paths in life. This creates a unique foundation for understanding and meaningful connection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
