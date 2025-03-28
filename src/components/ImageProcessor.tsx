
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { combineImages, createHeadshotVariant } from '../utils/imageUtils';

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

  // Generate images using our image processing utilities
  const generateImages = useCallback(async () => {
    if (!profilePhoto || !logo) {
      toast.error('Please upload both your profile photo and company logo');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate processing with progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      // Generate different image variations
      const generatedImages: GeneratedImage[] = [];
      
      // Update progress to 30%
      setProgress(30);
      
      // Generate profile pictures with different styles - removed monochrome
      const profileVariants = [
        'professional', 
        'artistic', 
        'minimal', 
        'bold',
        'gradient',
        'duotone',
        'vintage'
      ] as const;
      
      // Process images in parallel
      const profilePromises = profileVariants.map(async (variant, index) => {
        try {
          const imageUrl = await createHeadshotVariant(profilePhoto, logo, variant);
          return {
            id: `profile-${index + 1}`,
            url: imageUrl,
            type: 'profile' as const,
            name: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Headshot`
          };
        } catch (error) {
          console.error(`Error generating ${variant} profile:`, error);
          toast.error(`Failed to generate ${variant} profile`);
          return null;
        }
      });
      
      // Generate banner images
      setProgress(60);
      
      // Create two banner variations
      const bannerPromises = [
        combineImages(profilePhoto, logo, 'banner').then(url => ({
          id: 'banner-1',
          url,
          type: 'banner' as const,
          name: 'Professional LinkedIn Banner'
        })),
        // Create a second banner with a different style
        (async () => {
          // Create a canvas for the second banner style
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Unable to create canvas context');
          }
          
          // Set dimensions for LinkedIn banner
          canvas.width = 1584;
          canvas.height = 396;
          
          // Create gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(1, '#4f46e5');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Load images
          const profileImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(profilePhoto);
          });
          
          const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(logo);
          });
          
          // Add a circular profile image - prevent stretching
          const profileSize = 250;
          ctx.save();
          ctx.beginPath();
          ctx.arc(250, canvas.height / 2, profileSize / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Use drawImageProp equivalent function inline
          const drawCenteredImage = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
            const imgRatio = img.width / img.height;
            const containerRatio = w / h;
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (imgRatio > containerRatio) {
              drawHeight = h;
              drawWidth = img.width * (h / img.height);
              offsetX = (w - drawWidth) / 2;
              offsetY = 0;
            } else {
              drawWidth = w;
              drawHeight = img.height * (w / img.width);
              offsetX = 0;
              offsetY = (h - drawHeight) / 2;
            }
            
            ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
          };
          
          drawCenteredImage(
            profileImg, 
            250 - profileSize / 2, 
            canvas.height / 2 - profileSize / 2, 
            profileSize, 
            profileSize
          );
          ctx.restore();
          
          // Process logo to remove background
          const logoCanvas = document.createElement('canvas');
          const logoCtx = logoCanvas.getContext('2d');
          if (logoCtx) {
            logoCanvas.width = logoImg.width;
            logoCanvas.height = logoImg.height;
            
            logoCtx.drawImage(logoImg, 0, 0);
            
            // Improved background removal for logo
            const logoData = logoCtx.getImageData(0, 0, logoCanvas.width, logoCanvas.height);
            const data = logoData.data;
            
            // Find dominant background color (likely white or light color)
            let avgR = 0, avgG = 0, avgB = 0, count = 0;
            
            // Sample edges to determine background color
            for (let x = 0; x < 10; x++) {
              for (let y = 0; y < logoCanvas.height; y += 5) {
                const idx = (y * logoCanvas.width + x) * 4;
                avgR += data[idx];
                avgG += data[idx + 1];
                avgB += data[idx + 2];
                count++;
              }
              
              for (let y = 0; y < logoCanvas.height; y += 5) {
                const x = logoCanvas.width - 1 - (y % 10);
                const idx = (y * logoCanvas.width + x) * 4;
                avgR += data[idx];
                avgG += data[idx + 1];
                avgB += data[idx + 2];
                count++;
              }
            }
            
            avgR = Math.round(avgR / count);
            avgG = Math.round(avgG / count);
            avgB = Math.round(avgB / count);
            
            // Remove background based on similarity to detected color
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // Calculate color distance from background
              const distance = Math.sqrt(
                Math.pow(r - avgR, 2) + 
                Math.pow(g - avgG, 2) + 
                Math.pow(b - avgB, 2)
              );
              
              // Make background transparent
              if (distance < 40) {
                data[i + 3] = 0; // Fully transparent
              } else if (distance < 80) {
                data[i + 3] = Math.min(255, Math.round((distance / 40) * 255)); // Partial transparency
              }
            }
            
            logoCtx.putImageData(logoData, 0, 0);
          }
          
          // Add company logo - use drawCenteredImage to prevent stretching
          const logoSize = 160;
          drawCenteredImage(
            logoCanvas, 
            canvas.width - logoSize - 100, 
            canvas.height / 2 - logoSize / 2, 
            logoSize, 
            logoSize
          );
          
          // Add text
          ctx.font = 'bold 40px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText('Professional | Creative | Innovative', canvas.width / 2, canvas.height / 2);
          
          return {
            id: 'banner-2',
            url: canvas.toDataURL('image/png'),
            type: 'banner' as const,
            name: 'Modern LinkedIn Banner'
          };
        })()
      ];
      
      // Wait for all images to be generated
      const results = await Promise.all([...profilePromises, ...bannerPromises]);
      
      // Filter out any failed generations (null values)
      generatedImages.push(...results.filter(Boolean) as GeneratedImage[]);
      
      setProgress(100);
      clearInterval(progressInterval);
      
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
                  <span>Analyzing and cropping images</span>
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
