exports.notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  err.expose = true;
  next(err);
};

// Centralised error handler: always returns { success: false, message }.
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.expose ? err.message : 'Something went wrong. Please try again.';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found.';
  } else if (err.code === 11000) {
    status = 409;
    message = err.keyPattern?.email ? 'An account with this email already exists.' : 'You have already saved this URL.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message, ...(err.errorCode && { code: err.errorCode }) });
};
