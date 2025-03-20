
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
    
    // Draw the profile image
    ctx.drawImage(profileImg, 0, 0, 500, 500);
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
    
    // Add professional photo to left side
    const photoWidth = 300;
    const photoHeight = 300;
    const photoX = 100;
    const photoY = (canvas.height - photoHeight) / 2;
    
    // Draw circular mask for profile photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2, photoWidth/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(profileImg, photoX, photoY, photoWidth, photoHeight);
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
  variant: 'professional' | 'artistic' | 'minimal' | 'bold'
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
  
  // Apply different styles based on variant
  switch (variant) {
    case 'professional':
      // Professional style - clean with subtle logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 250, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(profileImg, 0, 0, 500, 500);
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
      ctx.drawImage(profileImg, 0, 0, 500, 500);
      
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
      ctx.drawImage(profileImg, 0, 0, 500, 500);
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
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(500, 0);
      ctx.lineTo(500, 500);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, 0, 0, 500, 500);
      
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
      ctx.restore();
      break;
  }
  
  return canvas.toDataURL('image/png');
};
