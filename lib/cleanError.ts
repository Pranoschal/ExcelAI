export default function getCleanErrorMessage  (error: unknown, context: string): string  {
  if (error instanceof Error) {
    // Extract just the main error message, not the full stack
    const message = error.message;
    
    // For network/connection errors, simplify the message
    if (message.includes('fetch') || message.includes('network') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      return `${context}: Connection failed`;
    }
    
    if (message.includes('timeout')) {
      return `${context}: Request timeout`;
    }
    
    if (message.includes('404')) {
      return `${context}: Service not found`;
    }
    
    if (message.includes('500')) {
      return `${context}: Server error`;
    }
    
    // Return first line of error message only
    return `${context}: ${message.split('\n')[0]}`;
  }
  
  return `${context}: Unknown error occurred`;
};