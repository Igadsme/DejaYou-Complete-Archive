import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimelineBuilder from "@/components/timeline-builder";
import LifeEventCard from "@/components/life-event-card";
import { Heart, ArrowLeft, Plus, History as TimelineIcon, Edit } from "lucide-react";
import { useState } from "react";

export default function History() {
  const { user } = useAuth();
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: userLifeEvents = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/user/life-events'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lightbg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 gradient-coral-sunset rounded-full flex items-center justify-center mx-auto mb-4">
            <TimelineIcon className="text-white animate-pulse" />
          </div>
          <p className="text-darktext/70">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  const categorizedEvents = {
    formative: userLifeEvents.filter((event: any) => event.category === 'formative'),
    turning_points: userLifeEvents.filter((event: any) => event.category === 'turning_points'),
    growth: userLifeEvents.filter((event: any) => event.category === 'growth'),
  };

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
              onClick={() => setShowBuilder(!showBuilder)}
              className="gradient-coral-sunset text-white px-4 py-2 rounded-full hover:shadow-warm transition-shadow"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showBuilder ? 'View History' : 'Add Event'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {showBuilder ? (
          <div>
            <div className="text-center mb-8">
              <h1 className="font-handwritten text-4xl font-bold text-darktext mb-2">
                Add to Your History
              </h1>
              <p className="text-darktext/70">Share more experiences that shaped who you are</p>
            </div>
            <TimelineBuilder onComplete={() => setShowBuilder(false)} />
          </div>
        ) : (
          <div>
            {/* Header */}
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
                {(user as any)?.firstName}'s Journey
              </h1>
              <p className="text-darktext/70 text-lg">
                {userLifeEvents.length} life event{userLifeEvents.length !== 1 ? 's' : ''} shared
              </p>
            </div>

            {userLifeEvents.length === 0 ? (
              /* Empty State */
              <Card className="shadow-warm max-w-2xl mx-auto">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TimelineIcon className="w-10 h-10 text-coral/50" />
                  </div>
                  <h2 className="font-handwritten text-2xl font-bold text-darktext mb-4">
                    Your timeline is waiting
                  </h2>
                  <p className="text-darktext/70 mb-6 max-w-md mx-auto">
                    Share the experiences that shaped you to find meaningful connections with people who understand your journey.
                  </p>
                  <Button
                    onClick={() => setShowBuilder(true)}
                    className="gradient-coral-sunset text-white px-6 py-3 rounded-full hover:shadow-warm transition-shadow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* History Display */
              <div className="space-y-12">
                {/* Formative Years */}
                {categorizedEvents.formative.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="w-4 h-4 bg-coral rounded-full mr-3"></div>
                      <h2 className="font-handwritten text-2xl font-bold text-darktext">
                        Formative Years
                      </h2>
                    </div>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-coral/30"></div>
                      <div className="space-y-6">
                        {categorizedEvents.formative.map((event: any, index: number) => (
                          <div key={event.id} className="relative flex items-start">
                            <div className="w-3 h-3 bg-coral rounded-full border-2 border-white shadow-sm z-10"></div>
                            <div className="ml-6 flex-1">
                              <LifeEventCard event={event} color="coral" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Turning Points */}
                {categorizedEvents.turning_points.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="w-4 h-4 bg-teal rounded-full mr-3"></div>
                      <h2 className="font-handwritten text-2xl font-bold text-darktext">
                        Turning Points
                      </h2>
                    </div>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-teal/30"></div>
                      <div className="space-y-6">
                        {categorizedEvents.turning_points.map((event: any, index: number) => (
                          <div key={event.id} className="relative flex items-start">
                            <div className="w-3 h-3 bg-teal rounded-full border-2 border-white shadow-sm z-10"></div>
                            <div className="ml-6 flex-1">
                              <LifeEventCard event={event} color="teal" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Growth */}
                {categorizedEvents.growth.length > 0 && (
                  <section>
                    <div className="flex items-center mb-6">
                      <div className="w-4 h-4 bg-sunset rounded-full mr-3"></div>
                      <h2 className="font-handwritten text-2xl font-bold text-darktext">
                        What I'm Growing Into
                      </h2>
                    </div>
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-sunset/30"></div>
                      <div className="space-y-6">
                        {categorizedEvents.growth.map((event: any, index: number) => (
                          <div key={event.id} className="relative flex items-start">
                            <div className="w-3 h-3 bg-sunset rounded-full border-2 border-white shadow-sm z-10"></div>
                            <div className="ml-6 flex-1">
                              <LifeEventCard event={event} color="sunset" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Add More Events CTA */}
                <div className="text-center pt-12">
                  <Card className="max-w-md mx-auto shadow-warm">
                    <CardContent className="text-center py-8">
                      <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-coral" />
                      </div>
                      <h3 className="font-handwritten text-xl font-bold text-darktext mb-2">
                        More to share?
                      </h3>
                      <p className="text-darktext/70 text-sm mb-4">
                        Add more experiences to create deeper connections
                      </p>
                      <Button
                        onClick={() => setShowBuilder(true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Life Event
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
