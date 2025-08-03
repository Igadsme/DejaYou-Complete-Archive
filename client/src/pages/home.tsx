import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, History, Users, MessageCircle, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();
  
  const { data: userLifeEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/user/life-events'],
    enabled: !!user,
  });

  const { data: matches = [] } = useQuery<any[]>({
    queryKey: ['/api/matches'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lightbg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-coral-sunset rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white animate-pulse" />
          </div>
          <p className="text-darktext/70">Loading your journey...</p>
        </div>
      </div>
    );
  }

  const needsOnboarding = !(user as any)?.onboardingCompleted || userLifeEvents.length === 0;

  return (
    <div className="min-h-screen bg-lightbg">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-softgray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-coral-sunset rounded-full flex items-center justify-center">
                <Heart className="text-white text-sm" />
              </div>
              <span className="font-handwritten text-2xl font-bold text-coral">DejaYou</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/timeline">
                <Button variant="ghost" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </Link>
              <Link href="/matches">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Matches
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            {(user as any)?.profileImageUrl ? (
              <img 
                src={(user as any).profileImageUrl} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover shadow-warm"
              />
            ) : (
              <div className="w-20 h-20 gradient-coral-sunset rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-handwritten">
                  {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || '?'}
                </span>
              </div>
            )}
          </div>
          <h1 className="font-handwritten text-4xl font-bold text-darktext mb-2">
            Welcome back, {(user as any)?.firstName || 'friend'}!
          </h1>
          <p className="text-darktext/70 text-lg">
            {needsOnboarding 
              ? "Let's start building your story"
              : "Your journey continues"
            }
          </p>
        </div>

        {needsOnboarding ? (
          /* Onboarding Flow */
          <div className="space-y-8">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="font-handwritten text-2xl text-darktext flex items-center">
                  <History className="w-6 h-6 mr-2 text-coral" />
                  Complete Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-darktext/80 mb-6">
                  Share your life experiences to find meaningful connections with people who've walked similar paths.
                </p>
                <Link href="/setup">
                  <Button className="gradient-coral-sunset text-white hover:shadow-warm transition-shadow">
                    Build My History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Why History Section */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-coral" />
                  </div>
                  <h3 className="font-medium text-darktext mb-2">Deeper Connections</h3>
                  <p className="text-sm text-darktext/70">Match based on shared experiences, not just interests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-teal" />
                  </div>
                  <h3 className="font-medium text-darktext mb-2">Understanding Partners</h3>
                  <p className="text-sm text-darktext/70">Find people who truly get what you've been through</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-sunset/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="text-sunset" />
                  </div>
                  <h3 className="font-medium text-darktext mb-2">Meaningful Conversations</h3>
                  <p className="text-sm text-darktext/70">Start with stories that matter, not small talk</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="grid md:grid-cols-2 gap-8">
            {/* Your History */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="font-handwritten text-xl text-darktext flex items-center">
                  <History className="w-5 h-5 mr-2 text-coral" />
                  Your History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-darktext/80 mb-4">
                  {userLifeEvents.length} life events shared
                </p>
                <div className="space-y-3 mb-6">
                  {userLifeEvents.slice(0, 3).map((event: any, index: number) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        index === 0 ? 'bg-coral' : index === 1 ? 'bg-teal' : 'bg-sunset'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm text-darktext">
                          {event.customTitle || event.lifeEvent?.title}
                        </p>
                        <p className="text-xs text-darktext/60">{event.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/timeline">
                  <Button variant="outline" className="w-full">
                    View Full History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="font-handwritten text-xl text-darktext flex items-center">
                  <Users className="w-5 h-5 mr-2 text-teal" />
                  Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-coral/50" />
                    </div>
                    <p className="text-darktext/70 mb-4">No matches yet</p>
                    <p className="text-sm text-darktext/60">Complete your timeline to start finding connections</p>
                  </div>
                ) : (
                  <>
                    <p className="text-darktext/80 mb-4">
                      {matches.length} meaningful connection{matches.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-3 mb-6">
                      {matches.slice(0, 3).map((match: any) => (
                        <div key={match.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-coral/20 to-teal/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-darktext">
                              {match.otherUser?.firstName?.[0] || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-darktext">
                              {match.otherUser?.firstName}
                            </p>
                            <p className="text-xs text-darktext/60">
                              {match.sharedEventsCount} shared experience{match.sharedEventsCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-xs text-coral font-medium">
                            {match.dejaScore}% match
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link href="/matches">
                      <Button variant="outline" className="w-full">
                        View All Matches
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {!needsOnboarding && (
          <div className="mt-12 text-center">
            <h2 className="font-handwritten text-2xl font-bold text-darktext mb-6">Ready to connect?</h2>
            <div className="flex justify-center space-x-4">
              <Link href="/matches">
                <Button className="gradient-coral-sunset text-white px-6 py-3 rounded-full hover:shadow-warm transition-shadow">
                  <Users className="w-4 h-4 mr-2" />
                  Discover Matches
                </Button>
              </Link>
              <Link href="/timeline">
                <Button variant="outline" className="px-6 py-3 rounded-full">
                  <History className="w-4 h-4 mr-2" />
                  Add Life Event
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
