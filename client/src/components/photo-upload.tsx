import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Plus, 
  X, 
  Star, 
  StarOff,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Photo {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
}

interface PhotoUploadProps {
  maxPhotos?: number;
  onPhotoChange?: (photos: Photo[]) => void;
}

export default function PhotoUpload({ maxPhotos = 6, onPhotoChange }: PhotoUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ['/api/user/photos'],
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (photoData: { imageUrl: string; displayOrder: number }) => {
      await apiRequest('POST', '/api/user/photos', photoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/photos'] });
      toast({
        title: "Photo added",
        description: "Your photo has been added to your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding photo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest('DELETE', `/api/user/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/photos'] });
      toast({
        title: "Photo removed",
        description: "Your photo has been removed from your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing photo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest('PATCH', `/api/user/photos/${photoId}/primary`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/photos'] });
      toast({
        title: "Primary photo updated",
        description: "Your main profile photo has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error setting primary photo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for now (in production, would upload to cloud storage)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        await addPhotoMutation.mutateAsync({
          imageUrl,
          displayOrder: photos.length,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoAction = (photoId: string, action: 'delete' | 'primary') => {
    if (action === 'delete') {
      deletePhotoMutation.mutate(photoId);
    } else if (action === 'primary') {
      setPrimaryMutation.mutate(photoId);
    }
  };

  const canAddMore = photos.length < maxPhotos;
  const primaryPhoto = photos.find(p => p.isPrimary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-handwritten text-2xl font-bold text-darktext mb-2">
          Show Your Best Self
        </h3>
        <p className="text-darktext/70 text-sm">
          Add up to {maxPhotos} photos to your profile. Your main photo will be shown first.
        </p>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Upload Button/First Photo Slot */}
        {photos.length === 0 ? (
          <Card 
            className="aspect-square bg-gradient-to-br from-coral/10 to-teal/10 border-2 border-dashed border-coral/30 hover:border-coral/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-4">
              <Camera className="w-8 h-8 text-coral mb-2" />
              <p className="text-sm font-medium text-darktext text-center">
                Add your first photo
              </p>
              <p className="text-xs text-darktext/60 text-center mt-1">
                This will be your main photo
              </p>
            </CardContent>
          </Card>
        ) : (
          // Existing Photos
          photos.map((photo, index) => (
            <Card key={photo.id} className="aspect-square relative group overflow-hidden">
              <CardContent className="p-0 h-full">
                <img
                  src={photo.imageUrl}
                  alt={`Profile photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary Badge */}
                {photo.isPrimary && (
                  <Badge className="absolute top-2 left-2 bg-coral text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Main
                  </Badge>
                )}

                {/* Action Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!photo.isPrimary && (
                        <DropdownMenuItem 
                          onClick={() => handlePhotoAction(photo.id, 'primary')}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Make main photo
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handlePhotoAction(photo.id, 'delete')}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove photo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Add More Button */}
        {canAddMore && photos.length > 0 && (
          <Card 
            className="aspect-square border-2 border-dashed border-softgray hover:border-coral/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-4">
              <Plus className="w-6 h-6 text-darktext/60 mb-2" />
              <p className="text-sm text-darktext/60 text-center">
                Add photo
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="text-center p-4 bg-coral/5 rounded-lg">
          <Upload className="w-6 h-6 text-coral mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-darktext">Uploading your photo...</p>
        </div>
      )}

      {/* Photo Count */}
      <div className="text-center">
        <p className="text-xs text-darktext/60">
          {photos.length} of {maxPhotos} photos
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!canAddMore || isUploading}
      />

      {/* Tips */}
      {photos.length === 0 && (
        <div className="bg-lightbg rounded-lg p-4">
          <h4 className="font-medium text-darktext mb-2 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-teal" />
            Photo Tips
          </h4>
          <ul className="text-sm text-darktext/70 space-y-1">
            <li>• Use clear, high-quality photos</li>
            <li>• Show your face in at least one photo</li>
            <li>• Include photos that show your personality</li>
            <li>• Avoid group photos as your main image</li>
          </ul>
        </div>
      )}
    </div>
  );
}