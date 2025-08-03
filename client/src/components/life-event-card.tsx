import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  Shield, 
  Calendar,
  MoreVertical,
  Eye,
  EyeOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LifeEventCardProps {
  event: any;
  color: 'coral' | 'teal' | 'sunset';
  showActions?: boolean;
}

export default function LifeEventCard({ event, color, showActions = true }: LifeEventCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customTitle: event.customTitle || event.lifeEvent?.title || '',
    customDescription: event.customDescription || event.lifeEvent?.description || '',
    personalStory: event.personalStory || '',
    ageWhenHappened: event.ageWhenHappened?.toString() || '',
    isSensitive: event.isSensitive || false,
    isVisible: event.isVisible !== false,
  });

  const updateEventMutation = useMutation({
    mutationFn: async (updates: any) => {
      await apiRequest('PATCH', `/api/user/life-events/${event.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/life-events'] });
      toast({
        title: "Event updated",
        description: "Your life event has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/user/life-events/${event.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/life-events'] });
      toast({
        title: "Event removed",
        description: "Your life event has been removed from your timeline.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!editForm.customTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your experience.",
        variant: "destructive",
      });
      return;
    }

    updateEventMutation.mutate({
      customTitle: editForm.customTitle,
      customDescription: editForm.customDescription,
      personalStory: editForm.personalStory,
      ageWhenHappened: editForm.ageWhenHappened ? parseInt(editForm.ageWhenHappened) : null,
      isSensitive: editForm.isSensitive,
      isVisible: editForm.isVisible,
    });
  };

  const handleCancel = () => {
    setEditForm({
      customTitle: event.customTitle || event.lifeEvent?.title || '',
      customDescription: event.customDescription || event.lifeEvent?.description || '',
      personalStory: event.personalStory || '',
      ageWhenHappened: event.ageWhenHappened?.toString() || '',
      isSensitive: event.isSensitive || false,
      isVisible: event.isVisible !== false,
    });
    setIsEditing(false);
  };

  const toggleVisibility = () => {
    updateEventMutation.mutate({
      isVisible: !event.isVisible,
    });
  };

  const colorClasses = {
    coral: 'bg-coral/10 border-coral/20',
    teal: 'bg-teal/10 border-teal/20',
    sunset: 'bg-sunset/10 border-sunset/20',
  };

  const badgeColors = {
    coral: 'bg-coral/20 text-coral',
    teal: 'bg-teal/20 text-teal',
    sunset: 'bg-sunset/20 text-sunset',
  };

  if (isEditing) {
    return (
      <Card className={`${colorClasses[color]} border-2`}>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="title">Experience Title</Label>
            <Input
              id="title"
              value={editForm.customTitle}
              onChange={(e) => setEditForm(prev => ({ ...prev, customTitle: e.target.value }))}
              placeholder="What happened?"
            />
          </div>

          <div>
            <Label htmlFor="description">Brief Description</Label>
            <Textarea
              id="description"
              value={editForm.customDescription}
              onChange={(e) => setEditForm(prev => ({ ...prev, customDescription: e.target.value }))}
              placeholder="Give a short overview..."
              className="h-16 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="personalStory">How It Shaped You</Label>
            <Textarea
              id="personalStory"
              value={editForm.personalStory}
              onChange={(e) => setEditForm(prev => ({ ...prev, personalStory: e.target.value }))}
              placeholder="Share how this experience changed you..."
              className="h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age When It Happened</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="100"
                value={editForm.ageWhenHappened}
                onChange={(e) => setEditForm(prev => ({ ...prev, ageWhenHappened: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sensitive"
                    checked={editForm.isSensitive}
                    onCheckedChange={(checked) => 
                      setEditForm(prev => ({ ...prev, isSensitive: !!checked }))
                    }
                  />
                  <Label htmlFor="sensitive" className="text-sm">Sensitive content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible"
                    checked={editForm.isVisible}
                    onCheckedChange={(checked) => 
                      setEditForm(prev => ({ ...prev, isVisible: !!checked }))
                    }
                  />
                  <Label htmlFor="visible" className="text-sm">Visible to matches</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateEventMutation.isPending}
              className="gradient-coral-sunset text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${colorClasses[color]} border-2 group hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-darktext">
                {event.customTitle || event.lifeEvent?.title}
              </h4>
              {event.isSensitive && (
                <Shield className="w-4 h-4 text-sunset" />
              )}
              {!event.isVisible && (
                <EyeOff className="w-4 h-4 text-darktext/50" />
              )}
            </div>

            {(event.customDescription || event.lifeEvent?.description) && (
              <p className="text-sm text-darktext/80 mb-2">
                {event.customDescription || event.lifeEvent?.description}
              </p>
            )}

            {event.personalStory && (
              <p className="text-sm text-darktext/70 italic mb-3">
                "{event.personalStory}"
              </p>
            )}

            <div className="flex items-center space-x-2">
              {event.ageWhenHappened && (
                <Badge variant="secondary" className={`text-xs ${badgeColors[color]}`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  Age {event.ageWhenHappened}
                </Badge>
              )}
              
              <Badge variant="secondary" className="text-xs bg-darktext/10 text-darktext/70">
                {event.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {showActions && (
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleVisibility}>
                    {event.isVisible ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide from matches
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show to matches
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteEventMutation.mutate()}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
