function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err?.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Please check the submitted information.',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'That record already exists.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
}

module.exports = { notFound, errorHandler };
