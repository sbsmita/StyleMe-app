/**
 * API Configuration with Security
 * This file handles API keys in a secure manner for production builds
 * and other service configurations.
 */

// Commented out react-native-config for now - will use environment variables or obfuscated fallback
import { FASHN_API_KEY,revenue_cat_apiKey } from '@env';

// Base64 encoding/decoding utilities for obfuscation
const encode = (str) => {
  try {
    return btoa(str);
  } catch (e) {
    // Fallback for environments without btoa
    return Buffer.from(str, 'utf8').toString('base64');
  }
};

const decode = (str) => {
  try {
    return atob(str);
  } catch (e) {
    // Fallback for environments without atob
    return Buffer.from(str, 'base64').toString('utf8');
  }
};


/**
 * Get the Fashn.ai API key securely
 */
export const getFashnApiKey = () => {


  return FASHN_API_KEY;
};

/**
 * Get the RevenueCat API key securely.
 * It's the same for both development and production.
 */
export const getRevenueCatApiKey = () => {
  return revenue_cat_apiKey || null;
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  FASHN_BASE_URL: 'https://api.fashn.ai/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  POLLING_INTERVAL: 2000,
  MAX_POLLING_ATTEMPTS: 30,
};

/**
 * Validate API configuration
 */
export const validateApiConfig = () => {
  const apiKey = getFashnApiKey();

  return {
    hasApiKey: !!apiKey,
    isConfigured: !!apiKey && apiKey.startsWith('fa-'),
    environment: __DEV__ ? 'development' : 'production',
  };
};

/**
 * Get obfuscated key info for logging (safe to log)
 */
export const getApiKeyInfo = () => {
  const apiKey = getFashnApiKey();
  if (!apiKey) return 'No API key configured';

  // Return only first 6 and last 4 characters for security
  return `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`;
};
