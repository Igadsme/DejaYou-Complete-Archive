import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  HelpCircle, 
  X, 
  MapPin, 
  Calendar,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Camera,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface MatchCardProps {
  user: any;
  onAction: (userId: string, action: 'relate' | 'curious' | 'pass') => void;
  isLoading?: boolean;
}

export default function MatchCard({ user, onAction, isLoading = false }: MatchCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: userPhotos = [] } = useQuery<any[]>({
    queryKey: ['/api/user/photos', user.id],
    enabled: !!user.id,
  });

  const visibleEvents = user.lifeEvents?.filter((event: any) => event.isVisible !== false) || [];
  const categorizedEvents = {
    formative: visibleEvents.filter((event: any) => event.category === 'formative'),
    turning_points: visibleEvents.filter((event: any) => event.category === 'turning_points'),
    growth: visibleEvents.filter((event: any) => event.category === 'growth'),
  };

  const categoryColors = {
    formative: 'coral',
    turning_points: 'teal',
    growth: 'sunset',
  };

  const categoryLabels = {
    formative: 'Formative Years',
    turning_points: 'Turning Points',
    growth: 'Growing Into',
  };

  const primaryPhoto = userPhotos.find((p: any) => p.isPrimary);
  const displayPhotos = userPhotos.length > 0 ? userPhotos : null;
  const currentPhoto = displayPhotos?.[currentPhotoIndex];

  const nextPhoto = () => {
    if (displayPhotos && currentPhotoIndex < displayPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <Card className="shadow-warm overflow-hidden max-w-sm mx-auto">
      <CardContent className="p-0">
        {/* Photo Section */}
        <div className="relative h-96 bg-gradient-to-br from-coral/10 to-teal/10">
          {currentPhoto ? (
            <>
              <img
                src={currentPhoto.imageUrl}
                alt={`${user.firstName}'s photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Photo Navigation */}
              {displayPhotos.length > 1 && (
                <>
                  {currentPhotoIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {currentPhotoIndex < displayPhotos.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* Photo Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                    {displayPhotos.map((_: any, index: number) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-darktext/60">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No photos</p>
              </div>
            </div>
          )}

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-handwritten text-2xl font-bold mb-1">
                  {user.firstName}, {user.age}
                </h3>
                {user.location && (
                  <p className="text-sm text-white/80 flex items-center mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {user.location}
                  </p>
                )}
                {user.bio && (
                  <p className="text-sm text-white/90 italic">
                    "{user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio}"
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-coral mb-1">
                  {user.dejaScore}%
                </div>
                <p className="text-xs text-white/70">DejaScore</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Pills */}
        <div className="p-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-coral/20 text-coral text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {visibleEvents.length} life events
          </Badge>
          {visibleEvents.some((event: any) => event.isSensitive) && (
            <Badge variant="secondary" className="bg-sunset/20 text-sunset text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Sensitive content
            </Badge>
          )}
          {displayPhotos && (
            <Badge variant="secondary" className="bg-teal/20 text-teal text-xs">
              <Camera className="w-3 h-3 mr-1" />
              {displayPhotos.length} photo{displayPhotos.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Timeline Preview */}
        <div className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-darktext">Life Journey</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className="text-darktext/60"
            >
              {showTimeline ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>

          <ScrollArea className={showTimeline ? "h-64" : "h-32"}>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line opacity-30"></div>
              
              <div className="space-y-6">
                {Object.entries(categorizedEvents).map(([category, events]) => {
                  if ((events as any[]).length === 0) return null;
                  
                  return (
                    <div key={category}>
                      {showTimeline && (
                        <div className="flex items-center mb-3">
                          <div className={`w-3 h-3 rounded-full mr-3 bg-${categoryColors[category as keyof typeof categoryColors]}`}></div>
                          <h5 className="font-handwritten text-sm font-bold text-darktext">
                            {categoryLabels[category as keyof typeof categoryLabels]}
                          </h5>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {(events as any[]).slice(0, showTimeline ? undefined : 2).map((event: any, index: number) => (
                          <div key={event.id} className="relative flex items-start">
                            <div className={`w-2 h-2 rounded-full border-2 border-white shadow-sm z-10 bg-${categoryColors[category as keyof typeof categoryColors]}`}></div>
                            <div className="ml-4 flex-1">
                              <div className={`rounded-lg p-3 bg-${categoryColors[category as keyof typeof categoryColors]}/10`}>
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium text-darktext">
                                    {event.customTitle || event.lifeEvent?.title}
                                  </p>
                                  {event.isSensitive && (
                                    <Shield className="w-3 h-3 text-sunset" />
                                  )}
                                </div>
                                
                                {(event.customDescription || event.lifeEvent?.description) && showTimeline && (
                                  <p className="text-xs text-darktext/70 mb-2">
                                    {event.customDescription || event.lifeEvent?.description}
                                  </p>
                                )}
                                
                                {event.personalStory && showTimeline && (
                                  <p className="text-xs text-darktext/80 italic">
                                    "{event.personalStory.length > 80 
                                      ? event.personalStory.substring(0, 80) + '...' 
                                      : event.personalStory}"
                                  </p>
                                )}
                                
                                {event.ageWhenHappened && (
                                  <p className="text-xs text-darktext/60 mt-1">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    Age {event.ageWhenHappened}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {!showTimeline && (events as any[]).length > 2 && (
                          <div className="relative flex items-start">
                            <div className="w-2 h-2 rounded-full border-2 border-white shadow-sm z-10 bg-darktext/30"></div>
                            <div className="ml-4">
                              <p className="text-xs text-darktext/60">
                                +{(events as any[]).length - 2} more experiences
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 border-t border-softgray">
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onAction(user.id, 'pass')}
              disabled={isLoading}
              className="w-16 h-16 bg-softgray/50 rounded-full text-darktext/60 hover:bg-softgray hover:text-darktext"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onAction(user.id, 'curious')}
              disabled={isLoading}
              className="w-16 h-16 bg-sunset/20 rounded-full text-sunset hover:bg-sunset/30"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onAction(user.id, 'relate')}
              disabled={isLoading}
              className="w-16 h-16 bg-coral/20 rounded-full text-coral hover:bg-coral/30"
            >
              <Heart className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="flex justify-center space-x-8 mt-2 text-xs text-darktext/60">
            <span>Pass</span>
            <span>Curious</span>
            <span>Relate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
