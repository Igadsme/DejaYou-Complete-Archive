import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import TimelineBuilder from "@/components/timeline-builder";
import PhotoUpload from "@/components/photo-upload";
import { Heart, ArrowLeft, ArrowRight, CheckCircle, User, Calendar, Camera } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 'basic', title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 'photos', title: 'Add Photos', description: 'Show your best self' },
  { id: 'timeline', title: 'Life Events', description: 'Share your journey' },
  { id: 'review', title: 'Review', description: 'Confirm your profile' },
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: (user as any)?.firstName || '',
    lastName: (user as any)?.lastName || '',
    age: (user as any)?.age || '',
    location: (user as any)?.location || '',
    bio: (user as any)?.bio || '',
    gender: (user as any)?.gender || '',
    genderPreference: (user as any)?.genderPreference || '',
  });

  const { data: userLifeEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/user/life-events'],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PATCH', '/api/user/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBasicInfoSubmit = async () => {
    if (!formData.firstName || !formData.age || !formData.location || !formData.gender || !formData.genderPreference) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including gender and preferences.",
        variant: "destructive",
      });
      return;
    }

    await updateProfileMutation.mutateAsync(formData);
    setCurrentStep(1);
  };

  const handleTimelineComplete = () => {
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    await updateProfileMutation.mutateAsync({
      onboardingCompleted: true,
    });
    
    toast({
      title: "Welcome to DejaYou!",
      description: "Your profile is complete. Start finding meaningful connections.",
    });
    
    setLocation('/');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-lightbg">
      {/* Header */}
      <div className="bg-white border-b border-softgray">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-coral-sunset rounded-full flex items-center justify-center">
                <Heart className="text-white text-sm" />
              </div>
              <span className="font-handwritten text-2xl font-bold text-coral">DejaYou</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-darktext/70">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Steps Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep 
                    ? 'gradient-coral-sunset text-white' 
                    : 'bg-softgray text-darktext/60'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 ${
                    index < currentStep ? 'bg-coral' : 'bg-softgray'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="font-handwritten text-3xl font-bold text-darktext mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-darktext/70">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <Card className="max-w-2xl mx-auto shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center text-darktext">
                <User className="w-5 h-5 mr-2 text-coral" />
                Tell us about yourself
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">I am *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="genderPreference">Interested in *</Label>
                  <Select value={formData.genderPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, genderPreference: value }))}>
                    <SelectTrigger id="genderPreference">
                      <SelectValue placeholder="Who are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">About You (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share a brief introduction..."
                  className="h-24"
                />
                <p className="text-xs text-darktext/60 mt-1">
                  Your life events will be your main profile. This is just a short intro.
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleBasicInfoSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="gradient-coral-sunset text-white px-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <PhotoUpload />
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setCurrentStep(2)}
                className="gradient-coral-sunset text-white px-8"
              >
                Continue to Timeline
                <Calendar className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <TimelineBuilder onComplete={handleTimelineComplete} />
            
            {userLifeEvents.length > 0 && (
              <div className="mt-8 text-center">
                <Button
                  onClick={handleTimelineComplete}
                  className="gradient-coral-sunset text-white px-6"
                >
                  Continue to Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto shadow-warm">
            <CardHeader>
              <CardTitle className="flex items-center text-darktext">
                <CheckCircle className="w-5 h-5 mr-2 text-coral" />
                Review Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Review */}
              <div>
                <h3 className="font-medium text-darktext mb-3">Basic Information</h3>
                <div className="bg-lightbg rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="font-medium">Age:</span> {formData.age}</p>
                  <p><span className="font-medium">Location:</span> {formData.location}</p>
                  <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                  <p><span className="font-medium">Looking for:</span> {formData.genderPreference}</p>
                  {formData.bio && (
                    <p><span className="font-medium">Bio:</span> {formData.bio}</p>
                  )}
                </div>
              </div>

              {/* Timeline Review */}
              <div>
                <h3 className="font-medium text-darktext mb-3">Life Events</h3>
                <div className="bg-lightbg rounded-lg p-4">
                  {userLifeEvents.length === 0 ? (
                    <p className="text-darktext/70 text-center py-4">
                      No life events added yet. You can add them later.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userLifeEvents.map((event: any, index: number) => (
                        <div key={event.id} className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            index % 3 === 0 ? 'bg-coral' : index % 3 === 1 ? 'bg-teal' : 'bg-sunset'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm text-darktext">
                              {event.customTitle || event.lifeEvent?.title}
                            </p>
                            <p className="text-xs text-darktext/60">
                              {event.category.replace('_', ' ')} 
                              {event.ageWhenHappened && ` • Age ${event.ageWhenHappened}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="gradient-coral-sunset text-white px-6"
                >
                  Complete Profile
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
