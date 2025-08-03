import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Check, 
  Heart, 
  Shield, 
  Sparkles, 
  Calendar,
  Edit,
  Trash2,
  ChevronDown,
  BookOpen
} from "lucide-react";

interface TimelineBuilderProps {
  onComplete?: () => void;
}

interface LifeEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  isSensitive: boolean;
}

export default function TimelineBuilder({ onComplete }: TimelineBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [customEvent, setCustomEvent] = useState({
    title: '',
    description: '',
    personalStory: '',
    category: 'formative',
    ageWhenHappened: '',
    isSensitive: false,
  });
  const [activeTab, setActiveTab] = useState('templates');

  const { data: templates = [], isLoading: templatesLoading } = useQuery<LifeEvent[]>({
    queryKey: ['/api/life-events/templates'],
  });

  const { data: userEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/user/life-events'],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      await apiRequest('POST', '/api/user/life-events', eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/life-events'] });
      toast({
        title: "Life event added",
        description: "Your experience has been added to your timeline.",
      });
      resetCustomEvent();
    },
    onError: (error) => {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetCustomEvent = () => {
    setCustomEvent({
      title: '',
      description: '',
      personalStory: '',
      category: 'formative',
      ageWhenHappened: '',
      isSensitive: false,
    });
  };

  const handleTemplateSelect = (event: LifeEvent) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(event.id)) {
      newSelected.delete(event.id);
    } else {
      newSelected.add(event.id);
    }
    setSelectedEvents(newSelected);
  };

  const handleAddSelectedTemplates = async () => {
    for (const eventId of Array.from(selectedEvents)) {
      const template = templates.find((t: LifeEvent) => t.id === eventId);
      if (template) {
        await createEventMutation.mutateAsync({
          lifeEventId: eventId,
          category: template.category,
          isSensitive: template.isSensitive,
        });
      }
    }
    setSelectedEvents(new Set());
  };

  const handleAddCustomEvent = async () => {
    if (!customEvent.title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your experience.",
        variant: "destructive",
      });
      return;
    }

    await createEventMutation.mutateAsync({
      customTitle: customEvent.title,
      customDescription: customEvent.description,
      personalStory: customEvent.personalStory,
      category: customEvent.category,
      ageWhenHappened: customEvent.ageWhenHappened ? parseInt(customEvent.ageWhenHappened) : null,
      isSensitive: customEvent.isSensitive,
    });
  };

  const categorizedTemplates = {
    formative: (templates as LifeEvent[]).filter((t: LifeEvent) => t.category === 'formative'),
    turning_points: (templates as LifeEvent[]).filter((t: LifeEvent) => t.category === 'turning_points'),
    growth: (templates as LifeEvent[]).filter((t: LifeEvent) => t.category === 'growth'),
  };

  const categoryLabels = {
    formative: 'Formative Years',
    turning_points: 'Turning Points',
    growth: 'What I\'m Growing Into',
  };

  const categoryColors = {
    formative: 'coral',
    turning_points: 'teal',
    growth: 'sunset',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-handwritten text-3xl font-bold text-darktext mb-2">
          Build Your Timeline
        </h2>
        <p className="text-darktext/70">
          Share the experiences that shaped who you are today
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Choose from Library</TabsTrigger>
          <TabsTrigger value="custom">Add Your Own</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center text-darktext">
                <BookOpen className="w-5 h-5 mr-2 text-coral" />
                Life Experience Library
              </CardTitle>
              <p className="text-sm text-darktext/70">
                Select experiences that resonate with your journey
              </p>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 gradient-coral-sunset rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-white animate-pulse" />
                  </div>
                  <p className="text-darktext/70">Loading experiences...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(categorizedTemplates).map(([category, events]) => (
                    <div key={category}>
                      <div className="flex items-center mb-4">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          category === 'formative' ? 'bg-coral' :
                          category === 'turning_points' ? 'bg-teal' : 'bg-sunset'
                        }`}></div>
                        <h3 className="font-handwritten text-xl font-bold text-darktext">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </h3>
                      </div>
                      
                      <div className="grid gap-3">
                        {(events as LifeEvent[]).map((event) => (
                          <div
                            key={event.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedEvents.has(event.id)
                                ? `border-${categoryColors[category as keyof typeof categoryColors]} bg-${categoryColors[category as keyof typeof categoryColors]}/10`
                                : 'border-softgray bg-white hover:border-coral/50 hover:bg-coral/5'
                            }`}
                            onClick={() => handleTemplateSelect(event)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <p className="font-medium text-darktext">{event.title}</p>
                                  {event.isSensitive && (
                                    <Shield className="w-4 h-4 text-sunset" />
                                  )}
                                </div>
                                {event.description && (
                                  <p className="text-sm text-darktext/70">{event.description}</p>
                                )}
                              </div>
                              <div className="ml-4">
                                {selectedEvents.has(event.id) ? (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    category === 'formative' ? 'bg-coral' :
                                    category === 'turning_points' ? 'bg-teal' : 'bg-sunset'
                                  }`}>
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-softgray"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {selectedEvents.size > 0 && (
                    <div className="sticky bottom-4 bg-white rounded-2xl border border-softgray shadow-warm p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-darktext">
                            {selectedEvents.size} experience{selectedEvents.size !== 1 ? 's' : ''} selected
                          </p>
                          <p className="text-sm text-darktext/70">
                            Add these to your timeline
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedEvents(new Set())}
                          >
                            Clear
                          </Button>
                          <Button
                            onClick={handleAddSelectedTemplates}
                            disabled={createEventMutation.isPending}
                            className="gradient-coral-sunset text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Timeline
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center text-darktext">
                <Edit className="w-5 h-5 mr-2 text-teal" />
                Share Your Unique Experience
              </CardTitle>
              <p className="text-sm text-darktext/70">
                Tell us about an experience that's not in our library
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Experience Title *</Label>
                <Input
                  id="title"
                  value={customEvent.title}
                  onChange={(e) => setCustomEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 'Started my own business at 25'"
                />
              </div>

              <div>
                <Label htmlFor="description">Brief Description</Label>
                <Textarea
                  id="description"
                  value={customEvent.description}
                  onChange={(e) => setCustomEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Give a short overview of what happened..."
                  className="h-20"
                />
              </div>

              <div>
                <Label htmlFor="personalStory">How It Shaped You *</Label>
                <Textarea
                  id="personalStory"
                  value={customEvent.personalStory}
                  onChange={(e) => setCustomEvent(prev => ({ ...prev, personalStory: e.target.value }))}
                  placeholder="Share how this experience changed you, what you learned, or how it affected your perspective..."
                  className="h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Life Stage</Label>
                  <Select
                    value={customEvent.category}
                    onValueChange={(value) => setCustomEvent(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formative">Formative Years</SelectItem>
                      <SelectItem value="turning_points">Turning Points</SelectItem>
                      <SelectItem value="growth">What I'm Growing Into</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="age">Age When It Happened</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="100"
                    value={customEvent.ageWhenHappened}
                    onChange={(e) => setCustomEvent(prev => ({ ...prev, ageWhenHappened: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sensitive"
                  checked={customEvent.isSensitive}
                  onCheckedChange={(checked) => 
                    setCustomEvent(prev => ({ ...prev, isSensitive: !!checked }))
                  }
                />
                <Label htmlFor="sensitive" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-sunset" />
                  <span>This is sensitive/tender content</span>
                </Label>
              </div>
              {customEvent.isSensitive && (
                <p className="text-xs text-darktext/60 ml-6">
                  Others will need to request consent before seeing details of this experience
                </p>
              )}

              <Separator />

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={resetCustomEvent}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleAddCustomEvent}
                  disabled={!customEvent.title.trim() || createEventMutation.isPending}
                  className="gradient-coral-sunset text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Current Timeline Preview */}
      {userEvents.length > 0 && (
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="flex items-center text-darktext">
              <Heart className="w-5 h-5 mr-2 text-coral" />
              Your Timeline ({userEvents.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userEvents.slice(0, 5).map((event: any, index: number) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    index % 3 === 0 ? 'bg-coral' : index % 3 === 1 ? 'bg-teal' : 'bg-sunset'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm text-darktext">
                        {event.customTitle || event.lifeEvent?.title}
                      </p>
                      {event.isSensitive && (
                        <Shield className="w-3 h-3 text-sunset" />
                      )}
                    </div>
                    <p className="text-xs text-darktext/60">
                      {event.category.replace('_', ' ')}
                      {event.ageWhenHappened && ` • Age ${event.ageWhenHappened}`}
                    </p>
                  </div>
                </div>
              ))}
              {userEvents.length > 5 && (
                <p className="text-xs text-center text-darktext/60 pt-2">
                  +{userEvents.length - 5} more events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      {userEvents.length > 0 && onComplete && (
        <div className="text-center">
          <Button
            onClick={onComplete}
            className="gradient-coral-sunset text-white px-8 py-3 rounded-full hover:shadow-warm transition-shadow"
            size="lg"
          >
            <Check className="w-5 h-5 mr-2" />
            Timeline Complete
          </Button>
        </div>
      )}
    </div>
  );
}
