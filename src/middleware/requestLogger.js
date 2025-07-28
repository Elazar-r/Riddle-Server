/**
 * Request Logger Middleware
 * Logs incoming HTTP requests
 */

const requestLogger = (req, res, next) => {
  // Skip logging during tests
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);

  // Log request body for POST/PUT requests (but hide sensitive data)
  if ((method === "POST" || method === "PUT") && req.body) {
    const safeBody = { ...req.body };
    // Hide sensitive fields
    if (safeBody.password) safeBody.password = "[HIDDEN]";
    if (safeBody.token) safeBody.token = "[HIDDEN]";

    console.log(`${timestamp} - Request Body:`, safeBody);
  }

  next();
};

export default requestLogger;