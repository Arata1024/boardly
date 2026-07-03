// Central error handler. Route handlers can call next(err) or throw inside
// an async wrapper; this keeps error formatting in one place instead of
// duplicating try/catch response shapes in every route.
export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Validation failed", details: err.issues });
  }

  const status = err.status ?? 500;
  const message = status === 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}

// Wraps an async route handler so rejected promises reach errorHandler
// instead of crashing the process or hanging the request.
export function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}
