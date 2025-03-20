
/**
 * Image manipulation utilities for headshot generation
 */

/**
 * Combines a profile photo with a company logo to create professional LinkedIn images
 */
export const combineImages = async (
  profilePhoto: File,
  logo: File,
  type: 'profile' | 'banner'
): Promise<string> => {
  // Create canvas to work with the images
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }

  // Load both images
  const [profileImg, logoImg] = await Promise.all([
    createImageFromFile(profilePhoto),
    createImageFromFile(logo)
  ]);

  if (type === 'profile') {
    // For profile pictures: Create professional headshot with logo in corner
    canvas.width = 500;
    canvas.height = 500;
    
    // Draw profile photo as base
    ctx.save();
    // Create circular mask
    ctx.beginPath();
    ctx.arc(250, 250, 250, 0, Math.PI * 2);
    ctx.clip();
    
    // Properly size and position the profile image to avoid stretching
    const size = Math.min(profileImg.width, profileImg.height);
    const offsetX = (profileImg.width - size) / 2;
    const offsetY = (profileImg.height - size) / 2;
    
    // Draw the profile image centered and cropped to avoid stretching
    ctx.drawImage(
      profileImg, 
      offsetX, offsetY, size, size, // Source rectangle
      0, 0, 500, 500               // Destination rectangle
    );
    ctx.restore();
    
    // Add logo in bottom right with slight transparency
    const logoSize = 100;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(logoImg, 400 - logoSize, 400 - logoSize, logoSize, logoSize);
    ctx.globalAlpha = 1.0;
    
    // Add subtle vignette effect
    addVignette(ctx, canvas.width, canvas.height);
    
    // Add subtle color enhancements
    enhanceColors(ctx, canvas.width, canvas.height);
  } else {
    // For banners: Create wide banner with profile and logo
    canvas.width = 1584;
    canvas.height = 396;
    
    // Fill with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f4f8');
    gradient.addColorStop(1, '#d1e2f2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add professional photo to left side - prevent stretching
    const photoWidth = 300;
    const photoHeight = 300;
    const photoX = 100;
    const photoY = (canvas.height - photoHeight) / 2;
    
    // Draw circular mask for profile photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2, photoWidth/2, 0, Math.PI * 2);
    ctx.clip();
    
    // Properly size and position the profile image
    const size = Math.min(profileImg.width, profileImg.height);
    const offsetX = (profileImg.width - size) / 2;
    const offsetY = (profileImg.height - size) / 2;
    
    ctx.drawImage(
      profileImg,
      offsetX, offsetY, size, size, // Source rectangle
      photoX, photoY, photoWidth, photoHeight // Destination rectangle
    );
    ctx.restore();
    
    // Add logo to right side
    const logoWidth = 200;
    const logoHeight = 200;
    const logoX = canvas.width - logoWidth - 100;
    const logoY = (canvas.height - logoHeight) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
    
    // Add separator line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 50);
    ctx.lineTo(canvas.width / 2, canvas.height - 50);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add text "Professional • Trustworthy • Expert"
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.fillText('Professional • Trustworthy • Expert', canvas.width / 2, canvas.height - 50);
  }
  
  // Return as data URL
  return canvas.toDataURL('image/png');
};

/**
 * Creates an Image object from a File
 */
const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Adds a vignette effect to enhance professional headshots
 */
const addVignette = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.3,
    width / 2, height / 2, height * 0.7
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Enhances colors to create a more professional look
 */
const enhanceColors = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Enhance contrast and saturation slightly
  for (let i = 0; i < data.length; i += 4) {
    // Increase contrast
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.1 + 128));
    data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * 1.1 + 128));
    data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * 1.1 + 128));
    
    // Increase saturation slightly
    const avg = (data[i] + data[i+1] + data[i+2]) / 3;
    data[i] = Math.min(255, Math.max(0, data[i] + (data[i] - avg) * 0.1));
    data[i+1] = Math.min(255, Math.max(0, data[i+1] + (data[i+1] - avg) * 0.1));
    data[i+2] = Math.min(255, Math.max(0, data[i+2] + (data[i+2] - avg) * 0.1));
  }
  
  // Put the enhanced image data back
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Creates a professional headshot variant with artistic effects
 */
export const createHeadshotVariant = async (
  profilePhoto: File,
  logo: File,
  variant: 'professional' | 'artistic' | 'minimal' | 'bold' | 'gradient' | 'duotone' | 'vintage' | 'monochrome'
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }

  // Load images
  const [profileImg, logoImg] = await Promise.all([
    createImageFromFile(profilePhoto),
    createImageFromFile(logo)
  ]);

  // Set canvas dimensions
  canvas.width = 500;
  canvas.height = 500;
  
  // Properly size and position the profile image to avoid stretching
  const size = Math.min(profileImg.width, profileImg.height);
  const offsetX = (profileImg.width - size) / 2;
  const offsetY = (profileImg.height - size) / 2;
  
  // Apply different styles based on variant
  switch (variant) {
    case 'professional':
      // Professional style - clean with subtle logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 250, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 0, 0, 500, 500);
      ctx.restore();
      
      // Add logo as small watermark
      const logoSize = 80;
      ctx.globalAlpha = 0.7;
      ctx.drawImage(logoImg, 400 - logoSize, 400 - logoSize, logoSize, logoSize);
      ctx.globalAlpha = 1.0;
      
      // Add subtle vignette
      addVignette(ctx, canvas.width, canvas.height);
      break;
      
    case 'artistic':
      // Artistic style - with color overlay and effects
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 250, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 0, 0, 500, 500);
      ctx.restore();
      
      // Add color overlay
      ctx.fillStyle = 'rgba(65, 105, 225, 0.2)'; // Royal blue with transparency
      ctx.fillRect(0, 0, 500, 500);
      
      // Add logo with blend mode
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.4;
      ctx.drawImage(logoImg, 150, 150, 200, 200);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      break;
      
    case 'minimal':
      // Minimal style - clean with thin border
      ctx.save();
      // Draw the profile with a border
      ctx.beginPath();
      ctx.arc(250, 250, 240, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 0, 0, 500, 500);
      ctx.restore();
      
      // Draw border
      ctx.beginPath();
      ctx.arc(250, 250, 240, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 10;
      ctx.stroke();
      
      // Add tiny logo in corner
      ctx.drawImage(logoImg, 400, 400, 60, 60);
      break;
      
    case 'bold':
      // Bold style - with strong elements
      // Split canvas diagonally
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(500, 0);
      ctx.lineTo(500, 500);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 0, 0, 500, 500);
      ctx.restore();
      
      // Bottom triangle with logo
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 500);
      ctx.lineTo(500, 500);
      ctx.closePath();
      ctx.clip();
      
      // Fill with color
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(0, 0, 500, 500);
      
      // Add logo to bottom triangle
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(logoImg, 150, 250, 200, 200);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
      break;
      
    case 'gradient':
      // Gradient background with circular profile image
      ctx.save();
      // Create gradient background
      const gradientBg = ctx.createLinearGradient(0, 0, 500, 500);
      gradientBg.addColorStop(0, '#3b82f6');
      gradientBg.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradientBg;
      ctx.fillRect(0, 0, 500, 500);
      
      // Create circular mask for profile photo
      ctx.beginPath();
      ctx.arc(250, 230, 180, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 70, 50, 360, 360);
      ctx.restore();
      
      // Add company name placeholder
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR NAME', 250, 440);
      
      // Add small logo
      const logoSizeGradient = 60;
      ctx.drawImage(logoImg, 250 - logoSizeGradient/2, 380 - logoSizeGradient/2, logoSizeGradient, logoSizeGradient);
      break;
      
    case 'duotone':
      // Duotone effect
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 250, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 0, 0, 500, 500);
      ctx.restore();
      
      // Apply duotone effect
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const lightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        
        // Duotone colors: dark blue to light blue
        pixels[i] = Math.min(255, lightness * 0.4);          // R
        pixels[i + 1] = Math.min(255, lightness * 0.7);      // G
        pixels[i + 2] = Math.min(255, lightness * 1.2);      // B
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      // Add logo watermark
      ctx.globalAlpha = 0.7;
      ctx.globalCompositeOperation = 'lighten';
      ctx.drawImage(logoImg, 350, 350, 120, 120);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      break;
      
    case 'vintage':
      // Vintage style with frame
      ctx.save();
      
      // Create vintage background texture
      ctx.fillStyle = '#e2d3b4';
      ctx.fillRect(0, 0, 500, 500);
      
      // Add noise texture
      const noiseData = ctx.createImageData(500, 500);
      const noise = noiseData.data;
      for (let i = 0; i < noise.length; i += 4) {
        const value = Math.floor(Math.random() * 20);
        noise[i] = noise[i + 1] = noise[i + 2] = value;
        noise[i + 3] = 30; // Alpha
      }
      ctx.putImageData(noiseData, 0, 0);
      
      // Draw decorative frame
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 20;
      ctx.strokeRect(40, 40, 420, 420);
      
      // Inner frame
      ctx.strokeStyle = '#D2B48C';
      ctx.lineWidth = 10;
      ctx.strokeRect(60, 60, 380, 380);
      
      // Draw circular profile photo
      ctx.beginPath();
      ctx.arc(250, 250, 170, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 80, 80, 340, 340);
      ctx.restore();
      
      // Apply sepia tone
      const vintageData = ctx.getImageData(0, 0, 500, 500);
      const vintagePixels = vintageData.data;
      for (let i = 0; i < vintagePixels.length; i += 4) {
        const r = vintagePixels[i];
        const g = vintagePixels[i + 1];
        const b = vintagePixels[i + 2];
        
        // Sepia formula
        vintagePixels[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        vintagePixels[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        vintagePixels[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
      ctx.putImageData(vintageData, 0, 0);
      
      // Add small logo
      ctx.drawImage(logoImg, 40, 430, 50, 50);
      break;
      
    case 'monochrome':
      // High contrast black and white
      ctx.save();
      
      // Create black background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 500, 500);
      
      // Draw profile with halftone-like effect
      ctx.beginPath();
      ctx.arc(250, 250, 230, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, offsetX, offsetY, size, size, 20, 20, 460, 460);
      
      // Apply high contrast black and white effect
      const monoData = ctx.getImageData(0, 0, 500, 500);
      const monoPixels = monoData.data;
      
      for (let i = 0; i < monoPixels.length; i += 4) {
        const brightness = (monoPixels[i] * 0.299) + (monoPixels[i + 1] * 0.587) + (monoPixels[i + 2] * 0.114);
        
        // High contrast threshold
        const threshold = brightness > 140 ? 255 : 0;
        monoPixels[i] = monoPixels[i + 1] = monoPixels[i + 2] = threshold;
      }
      
      ctx.putImageData(monoData, 0, 0);
      ctx.restore();
      
      // Add logo with inverse color effect
      ctx.save();
      ctx.globalCompositeOperation = 'difference';
      const logoSizeMono = 100;
      ctx.drawImage(logoImg, 500 - logoSizeMono - 20, 500 - logoSizeMono - 20, logoSizeMono, logoSizeMono);
      ctx.restore();
      break;
  }
  
  return canvas.toDataURL('image/png');
};

/**
 * Smart crops an image to focus on the face/important parts of the image
 * Simplified version without facial recognition
 */
export const smartCropImage = async (
  imageFile: File,
  targetWidth: number = 500,
  targetHeight: number = 500
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }
  
  // Load image
  const img = await createImageFromFile(imageFile);
  
  // Set canvas dimensions
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  // Determine the best square crop (center-focused)
  const size = Math.min(img.width, img.height);
  const offsetX = (img.width - size) / 2;
  const offsetY = (img.height - size) / 2;
  
  // Draw the cropped image onto the canvas
  ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, targetWidth, targetHeight);
  
  return canvas.toDataURL('image/png');
};

