# Optimize Images Hook

## Trigger
Before virtual try-on API calls

## Description
Automatically optimizes user-uploaded images for better virtual try-on results and reduced API costs, following performance standards.

## Actions

### 1. Image Validation
- Check image format (JPEG, PNG supported)
- Validate image dimensions (minimum 512x512)
- Verify file size limits (max 10MB)
- Ensure image aspect ratio is reasonable

### 2. Quality Assessment
- Analyze image brightness and contrast
- Check for blur or low resolution
- Detect if person is clearly visible
- Validate garment visibility in product images

### 3. Automatic Optimization
- Resize images to optimal dimensions (1024x1024 max)
- Compress images while maintaining quality
- Adjust brightness/contrast if needed
- Convert to optimal format for API

### 4. User Guidance
- Provide feedback on image quality
- Suggest improvements for better results
- Show before/after optimization preview
- Offer tips for taking better photos

## Implementation

```javascript
async function optimizeImages(userImage, garmentImage) {
  const results = {
    userImage: null,
    garmentImage: null,
    optimizations: [],
    warnings: []
  };

  try {
    // Optimize user image
    console.log('🖼️ Optimizing user image...');
    results.userImage = await optimizeImage(userImage, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.9,
      format: 'jpeg'
    });

    // Optimize garment image
    console.log('👕 Optimizing garment image...');
    results.garmentImage = await optimizeImage(garmentImage, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.95,
      format: 'jpeg'
    });

    // Analyze and provide feedback
    const userAnalysis = await analyzeImageQuality(results.userImage);
    const garmentAnalysis = await analyzeImageQuality(results.garmentImage);

    // Add optimization notes
    if (userAnalysis.brightness < 0.3) {
      results.warnings.push('User photo appears dark - consider better lighting');
    }
    
    if (garmentAnalysis.sharpness < 0.7) {
      results.warnings.push('Garment image appears blurry - use a clearer photo');
    }

    // Log optimizations performed
    results.optimizations = [
      'Resized to optimal dimensions',
      'Compressed for faster processing',
      'Converted to JPEG format',
      'Enhanced for AI processing'
    ];

    console.log('✅ Image optimization complete');
    return results;

  } catch (error) {
    console.error('❌ Image optimization failed:', error.message);
    throw new Error(`Image optimization failed: ${error.message}`);
  }
}

async function optimizeImage(image, options) {
  // Implementation would use image processing library
  // This is a placeholder for the actual optimization logic
  return {
    uri: image.uri, // Optimized image URI
    width: Math.min(image.width, options.maxWidth),
    height: Math.min(image.height, options.maxHeight),
    size: image.size * options.quality, // Estimated compressed size
    format: options.format
  };
}

async function analyzeImageQuality(image) {
  // Placeholder for image quality analysis
  return {
    brightness: 0.7,
    contrast: 0.8,
    sharpness: 0.9,
    overall: 0.8
  };
}
```

## Quality Checks

### Image Requirements
- Format: JPEG or PNG
- Minimum size: 512x512 pixels
- Maximum size: 10MB
- Aspect ratio: 0.5 to 2.0

### Optimization Targets
- Target size: 1024x1024 pixels
- File size: < 2MB after compression
- Quality: 90% for user images, 95% for garments
- Format: JPEG for best compatibility

### Performance Goals
- Optimization time: < 2 seconds
- Size reduction: 30-50% average
- Quality retention: > 90%
- API cost reduction: 20-30%

## User Experience

### Success Flow
1. User uploads images
2. Hook automatically optimizes
3. Shows optimization summary
4. Proceeds with virtual try-on
5. Better results due to optimization

### Warning Flow
1. Detects image quality issues
2. Shows specific warnings
3. Provides improvement suggestions
4. Allows user to re-upload or proceed
5. Logs quality metrics for analysis

## Integration
This hook integrates with:
- Image picker components
- Virtual try-on service
- User guidance system
- Performance monitoring
- Usage analytics