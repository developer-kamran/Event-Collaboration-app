export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }
  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate field value';
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  }

  res.status(status).json({ success: false, message });
};
