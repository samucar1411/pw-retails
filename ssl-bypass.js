// Force SSL bypass for development
if (process.env.NODE_ENV === 'development') {
  // Set environment variable
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  // Override HTTPS module
  const https = require('https');
  const tls = require('tls');
  
  // Override the default globalAgent
  const originalGlobalAgent = https.globalAgent;
  https.globalAgent = new https.Agent({
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
  });
  
  // Override createSecureContext
  const originalCreateSecureContext = tls.createSecureContext;
  tls.createSecureContext = function(options) {
    const context = originalCreateSecureContext.call(this, options);
    return context;
  };
  
  // Override request method
  const originalRequest = https.request;
  https.request = function(options, callback) {
    if (typeof options === 'string') {
      options = new URL(options);
    }
    if (typeof options === 'object') {
      options.rejectUnauthorized = false;
      options.checkServerIdentity = () => undefined;
    }
    return originalRequest.call(this, options, callback);
  };
  
}