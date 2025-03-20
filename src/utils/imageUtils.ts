
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

  // Process logo to remove background with improved technique
  const processedLogoImg = await removeBackgroundAdvanced(logoImg);

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
    
    // Center and crop the profile image to avoid stretching
    drawImageProp(ctx, profileImg, 0, 0, 500, 500);
    ctx.restore();
    
    // Add logo in bottom right with slight transparency
    const logoSize = 100;
    ctx.globalAlpha = 0.8;
    
    // Use proper drawing with aspect ratio preservation for logo
    drawImageProp(ctx, processedLogoImg, 400 - logoSize, 400 - logoSize, logoSize, logoSize);
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
    
    // Use drawImageProp to prevent stretching
    drawImageProp(ctx, profileImg, photoX, photoY, photoWidth, photoHeight);
    ctx.restore();
    
    // Add logo to right side with proper aspect ratio
    const logoWidth = 200;
    const logoHeight = 200;
    const logoX = canvas.width - logoWidth - 100;
    const logoY = (canvas.height - logoHeight) / 2;
    drawImageProp(ctx, processedLogoImg, logoX, logoY, logoWidth, logoHeight);
    
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
 * Properly draws an image maintaining aspect ratio and preventing stretching
 * This is a helper function to avoid stretched images
 */
const drawImageProp = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetX = 0.5,
  offsetY = 0.5
) => {
  // Default offset is center
  if (offsetX === undefined) offsetX = 0.5;
  if (offsetY === undefined) offsetY = 0.5;

  // Keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  // Calculate source dimensions and positions to avoid stretching
  let iw = img.width;
  let ih = img.height;
  let r = Math.min(w / iw, h / ih);
  let nw = iw * r;   // New prop. width
  let nh = ih * r;   // New prop. height
  let cx, cy, cw, ch, ar = 1;

  // Decide which gap to fill    
  if (nw < w) ar = w / nw;                             
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
  nw *= ar;
  nh *= ar;

  // Calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);
  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // Make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // Draw image
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
};

/**
 * Improved background removal for logos using color detection and edge preservation
 */
const removeBackgroundAdvanced = async (img: HTMLImageElement): Promise<HTMLImageElement> => {
  // Create a canvas to process the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }
  
  // Set canvas dimensions to match image
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw the original image
  ctx.drawImage(img, 0, 0);
  
  // Get the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Edge detection pre-processing - helps preserve logo edges
  const edges = detectEdges(data, canvas.width, canvas.height);
  
  // Find the most common background color (assuming background is consistent)
  const backgroundColor = findDominantBackgroundColor(data);
  
  // Color similarity threshold (higher = more aggressive removal)
  const threshold = 30; // Adjusted for better results
  
  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate color similarity to background
    const colorDistance = Math.sqrt(
      Math.pow(backgroundColor.r - r, 2) +
      Math.pow(backgroundColor.g - g, 2) +
      Math.pow(backgroundColor.b - b, 2)
    );
    
    // If close to background color and not an edge, make transparent
    if (colorDistance < threshold && !edges[i/4]) {
      data[i + 3] = 0; // Fully transparent
    }
    // For colors slightly similar to background, apply partial transparency
    else if (colorDistance < threshold * 1.5 && !edges[i/4]) {
      data[i + 3] = Math.min(255, Math.round((colorDistance / threshold) * 255));
    }
  }
  
  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0);
  
  // Create a new image from the canvas
  return new Promise((resolve) => {
    const newImg = new Image();
    newImg.onload = () => resolve(newImg);
    newImg.src = canvas.toDataURL('image/png');
  });
};

/**
 * Detect edges in an image to help with background removal
 */
const detectEdges = (data: Uint8ClampedArray, width: number, height: number): boolean[] => {
  const edges = new Array(data.length / 4).fill(false);
  const sobelThreshold = 30; // Edge detection sensitivity
  
  // Simple Sobel edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get surrounding pixels (for grayscale values)
      const tl = (data[((y-1) * width + (x-1)) * 4] + 
                 data[((y-1) * width + (x-1)) * 4 + 1] + 
                 data[((y-1) * width + (x-1)) * 4 + 2]) / 3;
      
      const t = (data[((y-1) * width + x) * 4] + 
                data[((y-1) * width + x) * 4 + 1] + 
                data[((y-1) * width + x) * 4 + 2]) / 3;
      
      const tr = (data[((y-1) * width + (x+1)) * 4] + 
                 data[((y-1) * width + (x+1)) * 4 + 1] + 
                 data[((y-1) * width + (x+1)) * 4 + 2]) / 3;
      
      const l = (data[(y * width + (x-1)) * 4] + 
                data[(y * width + (x-1)) * 4 + 1] + 
                data[(y * width + (x-1)) * 4 + 2]) / 3;
      
      const r = (data[(y * width + (x+1)) * 4] + 
                data[(y * width + (x+1)) * 4 + 1] + 
                data[(y * width + (x+1)) * 4 + 2]) / 3;
      
      const bl = (data[((y+1) * width + (x-1)) * 4] + 
                 data[((y+1) * width + (x-1)) * 4 + 1] + 
                 data[((y+1) * width + (x-1)) * 4 + 2]) / 3;
      
      const b = (data[((y+1) * width + x) * 4] + 
                data[((y+1) * width + x) * 4 + 1] + 
                data[((y+1) * width + x) * 4 + 2]) / 3;
      
      const br = (data[((y+1) * width + (x+1)) * 4] + 
                 data[((y+1) * width + (x+1)) * 4 + 1] + 
                 data[((y+1) * width + (x+1)) * 4 + 2]) / 3;
      
      // Sobel operator for horizontal and vertical gradients
      const gx = -tl - 2*l - bl + tr + 2*r + br;
      const gy = -tl - 2*t - tr + bl + 2*b + br;
      
      // Gradient magnitude
      const g = Math.sqrt(gx*gx + gy*gy);
      
      // Mark as edge if gradient is above threshold
      if (g > sobelThreshold) {
        edges[y * width + x] = true;
      }
    }
  }
  
  return edges;
};

/**
 * Find the most common color in the image borders (likely background)
 */
const findDominantBackgroundColor = (data: Uint8ClampedArray): { r: number, g: number, b: number } => {
  const colorCounts: Record<string, { count: number, r: number, g: number, b: number }> = {};
  const pixelCount = data.length / 4;
  const width = Math.sqrt(pixelCount); // Approximate width assuming square image
  
  // Sample pixels from the edge of the image
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    
    // Only sample from edges (10% inward)
    const edgeThreshold = width * 0.1;
    if (x < edgeThreshold || x > width - edgeThreshold || 
        y < edgeThreshold || y > width - edgeThreshold) {
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Group similar colors (reduce precision to group similar shades)
      const colorKey = `${Math.floor(r/10)},${Math.floor(g/10)},${Math.floor(b/10)}`;
      
      if (!colorCounts[colorKey]) {
        colorCounts[colorKey] = { count: 0, r, g, b };
      }
      
      colorCounts[colorKey].count++;
    }
  }
  
  // Find the most common color
  let maxCount = 0;
  let dominantColor = { r: 255, g: 255, b: 255 }; // Default to white
  
  for (const key in colorCounts) {
    if (colorCounts[key].count > maxCount) {
      maxCount = colorCounts[key].count;
      dominantColor = {
        r: colorCounts[key].r,
        g: colorCounts[key].g,
        b: colorCounts[key].b
      };
    }
  }
  
  return dominantColor;
};

/**
 * Removes the background from an image using simple transparency detection
 * (kept for compatibility)
 */
const removeBackground = async (img: HTMLImageElement): Promise<HTMLImageElement> => {
  // Create a canvas to process the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }
  
  // Set canvas dimensions
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw the original image
  ctx.drawImage(img, 0, 0);
  
  // Get the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Simple background removal by making white/light backgrounds transparent
  // This is a simplified approach - more advanced methods would use ML models
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate brightness
    const brightness = (r + g + b) / 3;
    
    // Make bright/white areas transparent
    if (brightness > 240) {
      data[i + 3] = 0; // Set alpha to 0 (transparent)
    }
    
    // Partial transparency for lighter areas
    else if (brightness > 220) {
      data[i + 3] = 128; // Semi-transparent
    }
  }
  
  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0);
  
  // Create a new image from the canvas
  return new Promise((resolve) => {
    const newImg = new Image();
    newImg.onload = () => resolve(newImg);
    newImg.src = canvas.toDataURL('image/png');
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
  variant: 'professional' | 'artistic' | 'minimal' | 'bold' | 'gradient' | 'duotone' | 'vintage'
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

  // Process logo to remove background with improved technique
  const processedLogoImg = await removeBackgroundAdvanced(logoImg);

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
      drawImageProp(ctx, profileImg, 0, 0, 500, 500);
      ctx.restore();
      
      // Add logo as small watermark
      const logoSize = 80;
      ctx.globalAlpha = 0.7;
      drawImageProp(ctx, processedLogoImg, 400 - logoSize, 400 - logoSize, logoSize, logoSize);
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
      drawImageProp(ctx, profileImg, 0, 0, 500, 500);
      ctx.restore();
      
      // Add color overlay
      ctx.fillStyle = 'rgba(65, 105, 225, 0.2)'; // Royal blue with transparency
      ctx.fillRect(0, 0, 500, 500);
      
      // Add logo with blend mode
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.4;
      drawImageProp(ctx, processedLogoImg, 150, 150, 200, 200);
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
      drawImageProp(ctx, profileImg, 0, 0, 500, 500);
      ctx.restore();
      
      // Draw border
      ctx.beginPath();
      ctx.arc(250, 250, 240, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 10;
      ctx.stroke();
      
      // Add tiny logo in corner
      drawImageProp(ctx, processedLogoImg, 400, 400, 60, 60);
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
      drawImageProp(ctx, profileImg, 0, 0, 500, 500);
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
      drawImageProp(ctx, processedLogoImg, 150, 250, 200, 200);
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
      drawImageProp(ctx, profileImg, 70, 50, 360, 360);
      ctx.restore();
      
      // Add company name placeholder
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR NAME', 250, 440);
      
      // Add small logo
      const logoSizeGradient = 60;
      drawImageProp(ctx, processedLogoImg, 250 - logoSizeGradient/2, 380 - logoSizeGradient/2, logoSizeGradient, logoSizeGradient);
      break;
      
    case 'duotone':
      // Duotone effect
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 250, 250, 0, Math.PI * 2);
      ctx.clip();
      drawImageProp(ctx, profileImg, 0, 0, 500, 500);
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
      drawImageProp(ctx, processedLogoImg, 350, 350, 120, 120);
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
      drawImageProp(ctx, profileImg, 80, 80, 340, 340);
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
      drawImageProp(ctx, processedLogoImg, 40, 430, 50, 50);
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
  
  // Use the proper drawing function to prevent stretching
  drawImageProp(ctx, img, 0, 0, targetWidth, targetHeight);
  
  return canvas.toDataURL('image/png');
};
