/**
 * Middleware to add cache control headers to responses
 */

/**
 * Add cache control headers to the response
 * @param {number} maxAge - Max age in seconds
 * @returns {Function} - Express middleware
 */
const cacheControl = (maxAge) => {
  return (req, res, next) => {
    // Skip caching for authenticated routes
    if (req.user) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      // Set cache headers for public routes
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      res.setHeader('Vary', 'Accept-Encoding');
    }
    next();
  };
};

/**
 * Cache static assets for 1 day (86400 seconds)
 */
const staticAssets = cacheControl(86400);

/**
 * Cache public API responses for 5 minutes (300 seconds)
 */
const publicApi = cacheControl(300);

/**
 * No cache for dynamic content
 */
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

module.exports = {
  cacheControl,
  staticAssets,
  publicApi,
  noCache,
};
