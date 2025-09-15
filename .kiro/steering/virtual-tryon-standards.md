---
inclusion: always
---

# Virtual Try-On Development Standards

## Code Quality Standards

### API Integration
- Always use proper error handling for AI service calls
- Implement retry logic for network failures
- Log API responses in development mode only
- Never expose API keys in client-side code

### Image Processing
- Convert images to base64 for API calls
- Validate image formats before processing
- Implement proper loading states during processing
- Handle large image files efficiently

### User Experience
- Show clear loading indicators during AI processing
- Provide meaningful error messages to users
- Implement usage tracking and limits
- Cache results when appropriate

## Virtual Try-On Specific Guidelines

### Fashn.ai Integration
- Use `product-to-model` model for best results
- Implement async job polling with proper timeouts
- Handle all job statuses: queued, processing, completed, failed
- Provide real-time status updates to users

### Image Quality
- Ensure user photos are well-lit and clear
- Validate garment images meet quality standards
- Implement automatic image optimization when needed
- Provide guidance for best photo practices

### Performance
- Limit concurrent API calls to prevent rate limiting
- Implement proper usage tracking per user
- Cache successful results to reduce API calls
- Optimize image sizes before API submission

## Testing Requirements

### Unit Tests
- Test all API integration functions
- Mock external API calls in tests
- Validate error handling scenarios
- Test image processing utilities

### Integration Tests
- Test complete virtual try-on flow
- Validate API key configuration
- Test async job polling logic
- Verify result image accessibility

## Security Guidelines

### API Security
- Store API keys securely
- Validate all user inputs
- Implement rate limiting
- Log security-relevant events

### Data Privacy
- Don't store user images permanently
- Implement proper data cleanup
- Follow GDPR compliance for EU users
- Provide clear privacy policies