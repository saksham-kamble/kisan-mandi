const { validationResult } = require('express-validator');

/** Run express-validator checks and return 400 if any fail */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return res.status(400).json({
      error: errorList[0]?.msg || 'Validation failed',
      errors: errorList,
    });
  }
  next();
};

module.exports = { validate };
