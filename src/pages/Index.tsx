
import React, { useState } from 'react';
import Header from '../components/Header';
import UploadSection from '../components/UploadSection';
import ImageProcessor, { GeneratedImage } from '../components/ImageProcessor';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';

const Index = () => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  const handleProfilePhotoUpload = (file: File) => {
    setProfilePhoto(file);
  };

  const handleLogoUpload = (file: File) => {
    setLogo(file);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  const handleImagesGenerated = (images: GeneratedImage[]) => {
    setGeneratedImages(images);
    setShowGallery(true);
    
    // Scroll to gallery section
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById('gallery')?.offsetTop || 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 animate-fade-in">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Professional LinkedIn Images in Seconds
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
                Elevate Your <span className="text-primary">LinkedIn</span> Presence
              </h1>
              
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed animate-slide-up animation-delay-100">
                Upload your photo and company logo to generate professional LinkedIn profile pictures and banners that showcase your brand identity.
              </p>
              
              <div className="mt-10 animate-slide-up animation-delay-200">
                <a 
                  href="#upload"
                  className="btn-primary inline-flex items-center gap-2 group"
                >
                  Create Your LinkedIn Images
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center animate-fade-in animation-delay-300">
                <div className="p-4 rounded-lg bg-card border border-border/50">
                  <div className="font-semibold text-lg">Fast</div>
                  <p className="text-muted-foreground text-xs mt-1">Generate in seconds</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border/50">
                  <div className="font-semibold text-lg">Easy</div>
                  <p className="text-muted-foreground text-xs mt-1">No design skills needed</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border/50">
                  <div className="font-semibold text-lg">Professional</div>
                  <p className="text-muted-foreground text-xs mt-1">Perfect for personal branding</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border/50">
                  <div className="font-semibold text-lg">Free</div>
                  <p className="text-muted-foreground text-xs mt-1">No hidden costs</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Upload Section */}
        <UploadSection
          onProfilePhotoUpload={handleProfilePhotoUpload}
          onLogoUpload={handleLogoUpload}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
        
        {/* Image Processor (invisible until generating) */}
        <ImageProcessor
          profilePhoto={profilePhoto}
          logo={logo}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          onImagesGenerated={handleImagesGenerated}
        />
        
        {/* Gallery Section */}
        <div id="gallery">
          <Gallery images={generatedImages} isVisible={showGallery} />
        </div>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold">Why Choose LinkPic?</h2>
              <p className="mt-4 text-muted-foreground">
                We make it easy to create professional LinkedIn visuals that help you stand out.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card p-6 rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Instant Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate professional LinkedIn profile pictures and banners in seconds, no waiting required.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Multiple Layouts</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from a variety of professionally designed layouts for your LinkedIn profile.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Brand Consistency</h3>
                <p className="text-sm text-muted-foreground">
                  Ensure your LinkedIn presence matches your company's brand identity with consistent visuals.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
