export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'שגיאת ולידציה',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      message: 'ערך זה כבר קיים במערכת'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'שגיאה בשרת'
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    message: 'הדף המבוקש לא נמצא'
  });
}; 