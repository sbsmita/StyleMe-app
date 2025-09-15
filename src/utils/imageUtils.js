/**
 * Image utility functions for virtual try-on
 */

/**
 * Resize image to optimal dimensions for AI processing
 */
export const resizeImageForAI = (imageUri, maxWidth = 1024, maxHeight = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = reject;
    img.src = imageUri;
  });
};

/**
 * Validate image for virtual try-on
 */
export const validateImageForTryOn = (imageUri) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      
      // Check minimum dimensions
      if (width < 256 || height < 256) {
        reject(new Error('Image too small. Minimum size is 256x256 pixels.'));
        return;
      }
      
      // Check aspect ratio for person images
      const aspectRatio = width / height;
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        console.warn('Unusual aspect ratio detected. Results may vary.');
      }
      
      resolve({
        width,
        height,
        aspectRatio,
        isValid: true,
      });
    };
    img.onerror = () => reject(new Error('Invalid image format'));
    img.src = imageUri;
  });
};

/**
 * Detect if image contains a person (simplified)
 */
export const detectPersonInImage = async (imageUri) => {
  // This is a placeholder for person detection
  // In a real app, you'd use a computer vision API or ML model
  try {
    await validateImageForTryOn(imageUri);
    // Simulate person detection with random confidence
    const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0
    return {
      hasPerson: confidence > 0.7,
      confidence,
      boundingBox: null, // Would contain person coordinates in real implementation
    };
  } catch (error) {
    throw new Error('Failed to analyze image for person detection');
  }
};

/**
 * Extract dominant colors from garment image
 */
export const extractGarmentColors = (imageUri) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Use small canvas for color sampling
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;
      
      // Simple color extraction (would use more sophisticated algorithm in production)
      const colorCounts = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.floor(data[i] / 32) * 32;
        const g = Math.floor(data[i + 1] / 32) * 32;
        const b = Math.floor(data[i + 2] / 32) * 32;
        const color = `rgb(${r},${g},${b})`;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
      
      // Get top 3 colors
      const sortedColors = Object.entries(colorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([color]) => color);
      
      resolve(sortedColors);
    };
    img.src = imageUri;
  });
};

/**
 * Generate thumbnail for history/preview
 */
export const generateThumbnail = (imageUri, size = 150) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = size;
      canvas.height = size;
      
      // Calculate crop dimensions to maintain aspect ratio
      const { width, height } = img;
      const minDim = Math.min(width, height);
      const x = (width - minDim) / 2;
      const y = (height - minDim) / 2;
      
      ctx.drawImage(img, x, y, minDim, minDim, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.7);
    };
    img.onerror = reject;
    img.src = imageUri;
  });
};

/**
 * Compare two images for similarity (basic implementation)
 */
export const compareImages = async (imageUri1, imageUri2) => {
  // This would use perceptual hashing or other image comparison techniques
  // For now, return a mock similarity score
  return {
    similarity: Math.random() * 0.3 + 0.7, // 0.7-1.0
    isDuplicate: false,
  };
};