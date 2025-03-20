
import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UploadSectionProps {
  onProfilePhotoUpload: (file: File) => void;
  onLogoUpload: (file: File) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  onProfilePhotoUpload,
  onLogoUpload,
  onGenerate,
  isGenerating
}) => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [isDraggingProfile, setIsDraggingProfile] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePhotoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProfile(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
      onProfilePhotoUpload(file);
    }
  }, [onProfilePhotoUpload]);

  const handleLogoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      onLogoUpload(file);
    }
  }, [onLogoUpload]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
      onProfilePhotoUpload(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      onLogoUpload(file);
    }
  };

  const canGenerate = profilePhoto && logo && !isGenerating;

  return (
    <section id="upload" className="w-full py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Profile Photo Upload */}
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-3">Profile Photo</h3>
              <div 
                className={`image-drop-area h-64 ${isDraggingProfile ? 'active' : ''} ${profilePhotoPreview ? 'border-primary/30' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingProfile(true); }}
                onDragLeave={() => setIsDraggingProfile(false)}
                onDrop={handleProfilePhotoDrop}
                onClick={() => profileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={profileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleProfilePhotoChange}
                />
                
                {profilePhotoPreview ? (
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <img 
                      src={profilePhotoPreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm">Change photo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-muted-foreground text-center">
                      Drag & drop your profile photo here<br />or click to browse
                    </p>
                    <span className="text-xs text-muted-foreground/70">
                      Supports JPG, PNG or WEBP
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Company Logo Upload */}
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-3">Company Logo</h3>
              <div 
                className={`image-drop-area h-64 ${isDraggingLogo ? 'active' : ''} ${logoPreview ? 'border-primary/30' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={handleLogoDrop}
                onClick={() => logoInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={logoInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                />
                
                {logoPreview ? (
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm">Change logo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-muted-foreground text-center">
                      Drag & drop your company logo here<br />or click to browse
                    </p>
                    <span className="text-xs text-muted-foreground/70">
                      Supports JPG, PNG or WEBP
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              className="btn-primary relative overflow-hidden group w-full max-w-xs"
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
                Generate LinkedIn Images
              </span>
              
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              <div className="absolute inset-0 w-full transform translate-y-full bg-primary/10 transition-transform duration-300 group-hover:translate-y-0"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
