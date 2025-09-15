---
inclusion: fileMatch
fileMatchPattern: '**/aiService.js'
---

# Fashn.ai API Integration Guidelines

## API Configuration Standards

### Authentication
- Store API keys securely, never in client-side code
- Use environment variables for API key management
- Implement proper API key validation before requests
- Handle authentication errors gracefully

### Request Format
- Always use the `product-to-model` model for virtual try-on
- Structure requests with `model_name` and `inputs` fields
- Include required fields: `model_image` and `product_image`
- Use base64 encoding for image data

### Async Processing
- All Fashn.ai requests are asynchronous with job IDs
- Implement proper job status polling with timeouts
- Handle all job statuses: `queued`, `processing`, `completed`, `failed`
- Set reasonable polling intervals (2-3 seconds)
- Implement maximum polling attempts (30 attempts = ~60 seconds)

## Error Handling Requirements

### API Errors
```javascript
// Required error handling pattern
if (response.status === 401) {
  throw new Error('Invalid Fashn.ai API key. Please check your API key.');
} else if (response.status === 402) {
  throw new Error('Insufficient credits. Please add credits to your Fashn.ai account.');
} else if (response.status === 429) {
  throw new Error('Rate limit exceeded. Please wait a moment and try again.');
} else if (response.status === 422) {
  throw new Error('Invalid request format. Please check image quality and format.');
}
```

### Job Status Errors
```javascript
// Handle job failures properly
if (result.status === 'failed') {
  throw new Error(`Job failed: ${result.error || 'Unknown error'}`);
} else if (result.status === 'timeout') {
  throw new Error('Processing timed out. Please try again with different images.');
}
```

## Image Processing Standards

### Input Validation
- Validate image formats (JPEG, PNG only)
- Check image dimensions (minimum 512x512)
- Verify file size limits (maximum 10MB)
- Ensure images are properly encoded as base64

### Optimization
- Resize images to optimal dimensions (1024x1024 recommended)
- Compress images while maintaining quality (90% JPEG quality)
- Convert images to JPEG format for best compatibility
- Remove EXIF data to reduce file size

## Performance Requirements

### Response Times
- Set connection timeout to 30 seconds
- Implement request timeout of 60 seconds for job submission
- Use 2-3 second intervals for status polling
- Maximum total processing time: 2 minutes

### Caching Strategy
- Cache successful results for 24 hours
- Use job ID as cache key
- Implement cache invalidation for failed jobs
- Store cache in AsyncStorage for persistence

### Rate Limiting
- Respect API rate limits (check documentation)
- Implement request queuing for high-volume usage
- Track usage per user and globally
- Provide clear feedback when limits are approached

## Logging and Monitoring

### Development Logging
```javascript
if (__DEV__) {
  console.log('👗 Calling Fashn.ai product-to-model');
  console.log('Job ID:', result.id);
  console.log('Polling for results...');
  console.log('Job completed:', finalResult.status);
}
```

### Production Monitoring
- Track API response times
- Monitor success/failure rates
- Log error frequencies and types
- Track usage costs and patterns

## Security Guidelines

### Data Privacy
- Don't store user images permanently
- Clear image data from memory after processing
- Implement proper data cleanup on app exit
- Follow GDPR compliance for EU users

### API Security
- Validate all user inputs before API calls
- Implement proper request signing if required
- Use HTTPS for all API communications
- Handle sensitive data according to privacy policies

## Testing Requirements

### Unit Tests
- Mock all Fashn.ai API calls in tests
- Test error handling for all failure scenarios
- Validate image processing functions
- Test async polling logic with different job statuses

### Integration Tests
- Test with real API using test images
- Validate complete virtual try-on flow
- Test timeout and retry scenarios
- Verify result image accessibility

## Code Examples

### Proper API Call Structure
```javascript
const payload = {
  model_name: 'product-to-model',
  inputs: {
    model_image: userImageBase64,
    product_image: garmentImageBase64,
    seed: Math.floor(Math.random() * 1000000),
  }
};
```

### Async Processing Pattern
```javascript
// Submit job
const response = await callFashnAPI(payload);
const result = await response.json();

// Poll for results
if (result.id) {
  const finalResult = await pollForResult(result.id);
  return processResult(finalResult);
}
```

### Error Recovery
```javascript
// Implement retry logic for network failures
let attempts = 0;
const maxAttempts = 3;

while (attempts < maxAttempts) {
  try {
    return await apiCall();
  } catch (error) {
    attempts++;
    if (attempts === maxAttempts) throw error;
    await delay(1000 * attempts); // Exponential backoff
  }
}
```