import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchCard from "@/components/match-card";
import SharedChapters from "@/components/shared-chapters";
import { Heart, ArrowLeft, Users, Sparkles, MessageCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Matches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const { data: matches = [], isLoading: matchesLoading } = useQuery<any[]>({
    queryKey: ['/api/matches'],
    enabled: !!user,
  });

  const { data: potentialMatches = [], isLoading: potentialLoading, refetch: refetchPotential } = useQuery<any[]>({
    queryKey: ['/api/matches/potential'],
    enabled: !!user,
  });

  const { data: sharedEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/matches', selectedMatch?.id, 'shared-events'],
    enabled: !!selectedMatch,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      await apiRequest('POST', `/api/matches/${userId}/action`, { action });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/matches/potential'] });
      
      if (variables.action === 'relate') {
        toast({
          title: "It's a potential match!",
          description: "If they relate to you too, you'll be able to see your shared chapters.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAction = (userId: string, action: 'relate' | 'curious' | 'pass') => {
    actionMutation.mutate({ userId, action });
  };

  if (matchesLoading || potentialLoading) {
    return (
      <div className="min-h-screen bg-lightbg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-coral-sunset rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white animate-pulse" />
          </div>
          <p className="text-darktext/70">Finding your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightbg">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-softgray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-coral-sunset rounded-full flex items-center justify-center">
                  <Heart className="text-white text-sm" />
                </div>
                <span className="font-handwritten text-2xl font-bold text-coral">DejaYou</span>
              </div>
            </div>
            <Button
              onClick={() => refetchPotential()}
              variant="outline"
              size="sm"
              disabled={potentialLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-handwritten text-4xl font-bold text-darktext mb-2">
            Your Connections
          </h1>
          <p className="text-darktext/70 text-lg">
            People who've walked similar paths
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Current Matches */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center text-darktext">
                  <Heart className="w-5 h-5 mr-2 text-coral" />
                  Your Matches ({matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-coral/50" />
                    </div>
                    <p className="text-darktext/70 mb-2">No matches yet</p>
                    <p className="text-sm text-darktext/60">Start exploring to find connections</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.map((match: any) => (
                      <div
                        key={match.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedMatch?.id === match.id
                            ? 'border-coral bg-coral/5'
                            : 'border-softgray hover:border-coral/50'
                        }`}
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 gradient-coral-teal rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {match.otherUser?.firstName?.[0] || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-darktext">
                              {match.otherUser?.firstName}
                            </p>
                            <p className="text-xs text-darktext/60">
                              {match.sharedEventsCount} shared experience{match.sharedEventsCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-coral font-medium">
                              {match.dejaScore}%
                            </div>
                            <Link href={`/chat/${match.id}`}>
                              <Button size="sm" variant="ghost">
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Potential Matches */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center text-darktext">
                  <Sparkles className="w-5 h-5 mr-2 text-teal" />
                  Discover People
                </CardTitle>
              </CardHeader>
              <CardContent>
                {potentialMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-teal/50" />
                    </div>
                    <p className="text-darktext/70 mb-2">No new connections</p>
                    <p className="text-sm text-darktext/60">Check back later for more people to connect with</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {potentialMatches.slice(0, 5).map((potentialMatch: any) => (
                      <MatchCard
                        key={potentialMatch.id}
                        user={potentialMatch}
                        onAction={handleAction}
                        isLoading={actionMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Shared Chapters */}
          <div className="lg:col-span-1">
            {selectedMatch ? (
              <SharedChapters
                match={selectedMatch}
                sharedEvents={sharedEvents}
              />
            ) : (
              <Card className="shadow-warm">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-sunset/50" />
                  </div>
                  <h3 className="font-handwritten text-xl font-bold text-darktext mb-2">
                    Shared Chapters
                  </h3>
                  <p className="text-darktext/70 text-sm">
                    Select a match to see your shared experiences and conversation starters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto shadow-warm">
            <CardContent className="text-center py-8">
              <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-coral" />
              </div>
              <h3 className="font-handwritten text-xl font-bold text-darktext mb-2">
                Need more connections?
              </h3>
              <p className="text-darktext/70 text-sm mb-4">
                Add more life events to find people with similar experiences
              </p>
              <Link href="/timeline">
                <Button variant="outline" className="w-full">
                  Add Life Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
