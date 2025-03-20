
import React, { useState } from 'react';
import { GeneratedImage } from './ImageProcessor';
import { toast } from 'sonner';

interface GalleryProps {
  images: GeneratedImage[];
  isVisible: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ images, isVisible }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'profile' | 'banner'>('all');
  
  const filteredImages = images.filter(img => 
    selectedTab === 'all' ? true : img.type === selectedTab
  );

  const downloadImage = (image: GeneratedImage) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `linkedin-${image.type}-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };
  
  if (!isVisible || images.length === 0) return null;
  
  return (
    <section className="w-full py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center animate-fade-in">Your LinkedIn Images</h2>
          
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm border bg-card p-1">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground hover:bg-muted'} transition-colors`}
                onClick={() => setSelectedTab('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedTab === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground hover:bg-muted'} transition-colors`}
                onClick={() => setSelectedTab('profile')}
              >
                Profile Pictures
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedTab === 'banner' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground hover:bg-muted'} transition-colors`}
                onClick={() => setSelectedTab('banner')}
              >
                Banners
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-card overflow-hidden rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow animate-scale-in"
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={image.url}
                    alt={image.name}
                    className={`w-full h-full ${image.type === 'profile' ? 'object-cover' : 'object-contain p-4'}`}
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-sm">{image.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {image.type === 'profile' ? 'Profile Picture' : 'LinkedIn Banner'}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadImage(image)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    aria-label="Download image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Share LinkPic
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
