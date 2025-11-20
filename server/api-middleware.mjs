/**
 * API Error Handling & Response Utilities
 * Standardized error responses and request validation middleware
 */

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(resource, id = null) {
    super(id ? `${resource} with ID ${id} not found` : `${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Send success response
 */
export function sendSuccess(res, data, message = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send error response
 */
export function sendError(res, error, statusCode = 500) {
  const response = {
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };

  // Add validation errors if present
  if (error.errors && Array.isArray(error.errors)) {
    response.validationErrors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send pagination response
 */
export function sendPaginatedResponse(res, data, pagination) {
  return res.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: pagination.totalItems,
      totalPages: Math.ceil(pagination.totalItems / pagination.pageSize)
    },
    timestamp: new Date().toISOString()
  });
}

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Create validation middleware for request body
 * @param {ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      return sendError(
        res,
        new ValidationError('Request validation failed', errors),
        400
      );
    }

    // Replace body with validated data
    req.body = result.data;
    next();
  };
}

/**
 * Create validation middleware for query parameters
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return sendError(
        res,
        new ValidationError('Query parameter validation failed', errors),
        400
      );
    }

    req.query = result.data;
    next();
  };
}

/**
 * Create validation middleware for URL parameters
 */
export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return sendError(
        res,
        new ValidationError('URL parameter validation failed', errors),
        400
      );
    }

    req.params = result.data;
    next();
  };
}

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handler middleware
 * Should be added last in middleware chain
 */
export function errorHandler(err, req, res, next) {
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Handle known error types
  if (err.statusCode) {
    return sendError(res, err, err.statusCode);
  }

  // Handle Supabase errors
  if (err.code) {
    const statusCode = mapSupabaseErrorCode(err.code);
    return sendError(res, err, statusCode);
  }

  // Default to 500 Internal Server Error
  return sendError(res, err, 500);
}

/**
 * Map Supabase error codes to HTTP status codes
 */
function mapSupabaseErrorCode(code) {
  const errorMap = {
    '22P02': 400, // Invalid input syntax
    '23505': 409, // Unique constraint violation
    '23503': 400, // Foreign key violation
    '42P01': 500, // Undefined table
    'PGRST116': 404, // Not found
    'PGRST204': 400, // Column not found
  };

  return errorMap[code] || 500;
}

/**
 * Async handler wrapper - catches async errors and passes to error handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitStore = new Map();

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    maxRequests = 100, // 100 requests per window
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    message = 'Too many requests, please try again later',
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);

    // Reset if window expired
    if (now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    // Increment counter
    record.count++;

    // Check if limit exceeded
    if (record.count > maxRequests) {
      res.set('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return sendError(res, new RateLimitError(message), 429);
    }

    // Add rate limit headers
    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', maxRequests - record.count);
    res.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    next();
  };
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================

export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  console.log(`➡️  ${req.method} ${req.url}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode < 400 ? '✅' : '❌';
    console.log(`${statusColor} ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });

  next();
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

const cacheStore = new Map();

/**
 * Simple in-memory cache middleware
 */
export function cacheResponse(durationMs = 60000) {
  return (req, res, next) => {
    const key = `${req.method}:${req.url}`;
    const cached = cacheStore.get(key);

    if (cached && Date.now() < cached.expiry) {
      console.log(`📦 Cache hit: ${key}`);
      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      if (res.statusCode === 200) {
        cacheStore.set(key, {
          data,
          expiry: Date.now() + durationMs
        });
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache for specific pattern
 */
export function clearCache(pattern) {
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}
