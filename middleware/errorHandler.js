
function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err.message);

  res.status(500).json({
    error: {
      code: "SERVER_ERROR",
      message: "An unexpected error occurred. Try Again",
    },
  });
}

module.exports = errorHandler;
