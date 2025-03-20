
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface GeneratedImage {
  id: string;
  url: string;
  type: 'profile' | 'banner';
  name: string;
}

interface ImageProcessorProps {
  profilePhoto: File | null;
  logo: File | null;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  onImagesGenerated: (images: GeneratedImage[]) => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({
  profilePhoto,
  logo,
  isGenerating,
  setIsGenerating,
  onImagesGenerated
}) => {
  const [progress, setProgress] = useState(0);

  // Mock image generation by simulating progress
  const generateImages = useCallback(async () => {
    if (!profilePhoto || !logo) {
      toast.error('Please upload both your profile photo and company logo');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate processing time with a progress indicator
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);

      // Create object URLs for the uploaded files
      const profileUrl = URL.createObjectURL(profilePhoto);
      const logoUrl = URL.createObjectURL(logo);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // For this mockup, we'll just return the original images
      // In a real app, these would be the processed images from your API
      const generatedImages: GeneratedImage[] = [
        {
          id: 'profile-1',
          url: profileUrl,
          type: 'profile',
          name: 'Professional Profile 1'
        },
        {
          id: 'profile-2',
          url: profileUrl,
          type: 'profile',
          name: 'Professional Profile 2'
        },
        {
          id: 'banner-1',
          url: logoUrl,
          type: 'banner',
          name: 'LinkedIn Banner 1'
        },
        {
          id: 'banner-2',
          url: logoUrl,
          type: 'banner',
          name: 'LinkedIn Banner 2'
        }
      ];

      clearInterval(progressInterval);
      setProgress(100);
      
      // Short delay before completing
      setTimeout(() => {
        onImagesGenerated(generatedImages);
        setIsGenerating(false);
        toast.success('Your LinkedIn images have been generated!');
      }, 500);
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
      setIsGenerating(false);
    }
  }, [profilePhoto, logo, onImagesGenerated, setIsGenerating]);

  useEffect(() => {
    if (isGenerating && profilePhoto && logo) {
      generateImages();
    }
  }, [isGenerating, profilePhoto, logo, generateImages]);

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card shadow-lg rounded-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
            <div className="mb-4 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <svg className="w-20 h-20 animate-spin-slow text-muted-foreground/30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <svg className="w-20 h-20 absolute top-0 left-0 text-primary" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray="283" 
                      strokeDashoffset={283 * (1 - progress / 100)}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{Math.round(progress)}%</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-4">Generating Your Images</h3>
              <p className="text-muted-foreground text-sm mt-2">
                We're combining your profile photo with your company logo to create professional LinkedIn visuals.
              </p>
            </div>
            
            <div className="mt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing images</span>
                  <span className="text-primary">{progress > 30 ? 'Done' : 'Processing...'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Creating profile pictures</span>
                  <span className={progress > 60 ? 'text-primary' : 'text-muted-foreground'}>
                    {progress > 60 ? 'Done' : 'Waiting...'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Creating banners</span>
                  <span className={progress > 90 ? 'text-primary' : 'text-muted-foreground'}>
                    {progress > 90 ? 'Done' : 'Waiting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageProcessor;
