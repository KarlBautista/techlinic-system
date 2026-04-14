/**
 * Backend validation middleware for TechClinic.
 * Uses express-validator for enterprise-grade input validation & sanitisation.
 * Mirrors frontend validation rules for hybrid security.
 */

const { body, param, query, validationResult } = require('express-validator');

// ────────────────────────────────────────────
// Constants (must mirror frontend validation.js)
// ────────────────────────────────────────────
const LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  ADDRESS_MAX: 500,
  STUDENT_ID_MAX: 20,
  CONTACT_MIN: 7,
  CONTACT_MAX: 15,
  MEDICINE_NAME_MAX: 200,
  GENERIC_NAME_MAX: 200,
  BRAND_MAX: 200,
  TYPE_MAX: 100,
  DOSAGE_MAX: 100,
  UNIT_MAX: 50,
  BATCH_MAX: 50,
  STOCK_MIN: 0,
  STOCK_MAX: 999999,
  TREATMENT_MAX: 2000,
  NOTES_MAX: 2000,
  DISEASE_NAME_MAX: 200,
  SEARCH_MAX: 200,
  EXCUSED_DAYS_MAX: 365,
};

const ENUMS = {
  SEX: ['Male', 'Female'],
  ROLE: ['DOCTOR', 'NURSE'],
  DEPARTMENT: [
    'College of Science',
    'College of Engineering',
    'College of Industrial Technology',
    'College of Architecture and Fine Arts',
    'College of Industrial Education',
    'College of Liberal Arts',
  ],
  YEAR_LEVEL: ['1st year', '2nd year', '3rd year', '4th year', '1', '2', '3', '4'],
};

// ────────────────────────────────────────────
// Shared error handler
// ────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ────────────────────────────────────────────
// Patient registration (public + nurse insert)
// ────────────────────────────────────────────
const validatePatient = [
  body('formData.firstName')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: LIMITS.NAME_MAX }).withMessage(`First name must not exceed ${LIMITS.NAME_MAX} characters.`)
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('First name may only contain letters, spaces, hyphens, and apostrophes.')
    .escape(),
  body('formData.lastName')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: LIMITS.NAME_MAX }).withMessage(`Last name must not exceed ${LIMITS.NAME_MAX} characters.`)
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Last name may only contain letters, spaces, hyphens, and apostrophes.')
    .escape(),
  body('formData.studentId')
    .trim().notEmpty().withMessage('Student ID is required.')
    .isLength({ max: LIMITS.STUDENT_ID_MAX }).withMessage(`Student ID must not exceed ${LIMITS.STUDENT_ID_MAX} characters.`)
    .matches(/^[A-Z0-9-]+$/i).withMessage('Student ID may only contain letters, numbers, and hyphens.'),
  body('formData.email')
    .trim().notEmpty().withMessage('Email is required.')
    .isLength({ max: LIMITS.EMAIL_MAX }).withMessage(`Email must not exceed ${LIMITS.EMAIL_MAX} characters.`)
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('formData.contactNumber')
    .trim().notEmpty().withMessage('Contact number is required.')
    .isLength({ min: LIMITS.CONTACT_MIN, max: LIMITS.CONTACT_MAX })
    .withMessage(`Contact number must be between ${LIMITS.CONTACT_MIN} and ${LIMITS.CONTACT_MAX} characters.`)
    .matches(/^[0-9+\-() ]{7,15}$/).withMessage('Contact number format is invalid.'),
  body('formData.sex')
    .trim().notEmpty().withMessage('Sex is required.')
    .isIn(ENUMS.SEX).withMessage(`Sex must be one of: ${ENUMS.SEX.join(', ')}.`),
  body('formData.department')
    .trim().notEmpty().withMessage('Department is required.')
    .isIn(ENUMS.DEPARTMENT).withMessage(`Department must be one of: ${ENUMS.DEPARTMENT.join(', ')}.`),
  body('formData.yearLevel')
    .trim().notEmpty().withMessage('Year level is required.')
    .isIn(ENUMS.YEAR_LEVEL).withMessage(`Year level must be one of: ${ENUMS.YEAR_LEVEL.join(', ')}.`),
  body('formData.address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.ADDRESS_MAX }).withMessage(`Address must not exceed ${LIMITS.ADDRESS_MAX} characters.`)
    .escape(),
  body('formData.dateOfBirth')
    .trim().notEmpty().withMessage('Date of birth is required.')
    .isISO8601().withMessage('Date of birth must be a valid date.')
    .custom((value) => {
      const dob = new Date(value);
      if (dob >= new Date()) throw new Error('Date of birth must be in the past.');
      return true;
    }),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Insert record (nurse) – patient fields + optional diagnosis
// ────────────────────────────────────────────
const validateInsertRecord = [
  ...validatePatient.slice(0, -1), // all patient validators minus the error handler
  body('formData.treatment')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.TREATMENT_MAX }).withMessage(`Treatment must not exceed ${LIMITS.TREATMENT_MAX} characters.`)
    .escape(),
  body('formData.notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.NOTES_MAX }).withMessage(`Notes must not exceed ${LIMITS.NOTES_MAX} characters.`)
    .escape(),
  body('formData.quantity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: LIMITS.STOCK_MAX }).withMessage('Quantity must be a positive integer.'),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Insert/Add diagnosis (doctor)
// ────────────────────────────────────────────
const validateAddDiagnosis = [
  body('patientInput.id')
    .notEmpty().withMessage('Record ID is required.'),
  body('patientInput.diagnosis')
    .trim().notEmpty().withMessage('Diagnosis is required.')
    .isLength({ max: LIMITS.DISEASE_NAME_MAX }).withMessage(`Diagnosis must not exceed ${LIMITS.DISEASE_NAME_MAX} characters.`)
    .escape(),
  body('patientInput.treatment')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.TREATMENT_MAX }).withMessage(`Treatment must not exceed ${LIMITS.TREATMENT_MAX} characters.`)
    .escape(),
  body('patientInput.notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.NOTES_MAX }).withMessage(`Notes must not exceed ${LIMITS.NOTES_MAX} characters.`)
    .escape(),
  body('patientInput.quantity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: LIMITS.STOCK_MAX }).withMessage('Quantity must be a positive integer.'),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Insert medicine
// ────────────────────────────────────────────
const validateInsertMedicine = [
  body('medicine.name')
    .trim().notEmpty().withMessage('Medicine name is required.')
    .isLength({ max: LIMITS.MEDICINE_NAME_MAX }).withMessage(`Medicine name must not exceed ${LIMITS.MEDICINE_NAME_MAX} characters.`)
    .escape(),
  body('medicine.generic')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.GENERIC_NAME_MAX }).withMessage(`Generic name must not exceed ${LIMITS.GENERIC_NAME_MAX} characters.`)
    .escape(),
  body('medicine.brand')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.BRAND_MAX }).withMessage(`Brand must not exceed ${LIMITS.BRAND_MAX} characters.`)
    .escape(),
  body('medicine.type')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.TYPE_MAX }).withMessage(`Type must not exceed ${LIMITS.TYPE_MAX} characters.`)
    .escape(),
  body('medicine.dosage')
    .trim().notEmpty().withMessage('Dosage is required.')
    .isLength({ max: LIMITS.DOSAGE_MAX }).withMessage(`Dosage must not exceed ${LIMITS.DOSAGE_MAX} characters.`),
  body('medicine.unit')
    .trim().notEmpty().withMessage('Unit of measure is required.')
    .isLength({ max: LIMITS.UNIT_MAX }).withMessage(`Unit must not exceed ${LIMITS.UNIT_MAX} characters.`),
  body('medicine.stock')
    .notEmpty().withMessage('Stock level is required.')
    .isInt({ min: LIMITS.STOCK_MIN, max: LIMITS.STOCK_MAX }).withMessage(`Stock must be a whole number between ${LIMITS.STOCK_MIN} and ${LIMITS.STOCK_MAX}.`),
  body('medicine.batch')
    .trim().notEmpty().withMessage('Batch number is required.')
    .isLength({ max: LIMITS.BATCH_MAX }).withMessage(`Batch number must not exceed ${LIMITS.BATCH_MAX} characters.`)
    .matches(/^[A-Za-z0-9\s\-/]+$/).withMessage('Batch number may only contain letters, numbers, hyphens, and slashes.'),
  body('medicine.expiry')
    .trim().notEmpty().withMessage('Expiry date is required.')
    .isISO8601().withMessage('Expiry date must be a valid date.')
    .custom((value) => {
      const expiry = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) throw new Error('Expiry date must be in the future.');
      return true;
    }),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Update medicine
// ────────────────────────────────────────────
const validateUpdateMedicine = [
  body('medicine.id')
    .notEmpty().withMessage('Medicine ID is required.'),
  body('medicine.medicine_name')
    .trim().notEmpty().withMessage('Medicine name is required.')
    .isLength({ max: LIMITS.MEDICINE_NAME_MAX }).withMessage(`Medicine name must not exceed ${LIMITS.MEDICINE_NAME_MAX} characters.`)
    .escape(),
  body('medicine.generic_name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.GENERIC_NAME_MAX }).withMessage(`Generic name must not exceed ${LIMITS.GENERIC_NAME_MAX} characters.`)
    .escape(),
  body('medicine.brand')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.BRAND_MAX }).withMessage(`Brand must not exceed ${LIMITS.BRAND_MAX} characters.`)
    .escape(),
  body('medicine.type')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.TYPE_MAX }).withMessage(`Type must not exceed ${LIMITS.TYPE_MAX} characters.`)
    .escape(),
  body('medicine.dosage')
    .trim().notEmpty().withMessage('Dosage is required.')
    .isLength({ max: LIMITS.DOSAGE_MAX }).withMessage(`Dosage must not exceed ${LIMITS.DOSAGE_MAX} characters.`),
  body('medicine.unit_of_measure')
    .trim().notEmpty().withMessage('Unit of measure is required.')
    .isLength({ max: LIMITS.UNIT_MAX }).withMessage(`Unit must not exceed ${LIMITS.UNIT_MAX} characters.`),
  body('medicine.stock_level')
    .notEmpty().withMessage('Stock level is required.')
    .isInt({ min: LIMITS.STOCK_MIN, max: LIMITS.STOCK_MAX }).withMessage(`Stock must be a whole number between ${LIMITS.STOCK_MIN} and ${LIMITS.STOCK_MAX}.`),
  body('medicine.batch_number')
    .trim().notEmpty().withMessage('Batch number is required.')
    .isLength({ max: LIMITS.BATCH_MAX }).withMessage(`Batch number must not exceed ${LIMITS.BATCH_MAX} characters.`)
    .matches(/^[A-Za-z0-9\s\-/]+$/).withMessage('Batch number may only contain letters, numbers, hyphens, and slashes.'),
  body('medicine.expiry_date')
    .trim().notEmpty().withMessage('Expiry date is required.')
    .isISO8601().withMessage('Expiry date must be a valid date.'),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Insert personnel (admin adds staff)
// ────────────────────────────────────────────
const validateInsertPersonnel = [
  body('personnel.first_name')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: LIMITS.NAME_MAX }).withMessage(`First name must not exceed ${LIMITS.NAME_MAX} characters.`)
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('First name may only contain letters, spaces, hyphens, and apostrophes.')
    .escape(),
  body('personnel.last_name')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: LIMITS.NAME_MAX }).withMessage(`Last name must not exceed ${LIMITS.NAME_MAX} characters.`)
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Last name may only contain letters, spaces, hyphens, and apostrophes.')
    .escape(),
  body('personnel.email')
    .trim().notEmpty().withMessage('Email is required.')
    .isLength({ max: LIMITS.EMAIL_MAX }).withMessage(`Email must not exceed ${LIMITS.EMAIL_MAX} characters.`)
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('personnel.password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: LIMITS.PASSWORD_MIN }).withMessage(`Password must be at least ${LIMITS.PASSWORD_MIN} characters.`)
    .isLength({ max: LIMITS.PASSWORD_MAX }).withMessage(`Password must not exceed ${LIMITS.PASSWORD_MAX} characters.`)
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character.'),
  body('personnel.role')
    .trim().notEmpty().withMessage('Role is required.')
    .isIn(ENUMS.ROLE).withMessage(`Role must be one of: ${ENUMS.ROLE.join(', ')}.`),
  body('personnel.sex')
    .trim().notEmpty().withMessage('Sex is required.')
    .isIn(ENUMS.SEX).withMessage(`Sex must be one of: ${ENUMS.SEX.join(', ')}.`),
  body('personnel.address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: LIMITS.ADDRESS_MAX }).withMessage(`Address must not exceed ${LIMITS.ADDRESS_MAX} characters.`)
    .escape(),
  body('personnel.date_of_birth')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Date of birth must be a valid date.')
    .custom((value) => {
      const dob = new Date(value);
      if (dob >= new Date()) throw new Error('Date of birth must be in the past.');
      return true;
    }),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Add disease
// ────────────────────────────────────────────
const validateAddDisease = [
  body('name')
    .trim().notEmpty().withMessage('Disease name is required.')
    .isLength({ max: LIMITS.DISEASE_NAME_MAX }).withMessage(`Disease name must not exceed ${LIMITS.DISEASE_NAME_MAX} characters.`)
    .escape(),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Param ID validators
// ────────────────────────────────────────────
const validateStudentIdParam = [
  param('studentId')
    .trim().notEmpty().withMessage('Student ID is required.')
    .isLength({ max: LIMITS.STUDENT_ID_MAX }).withMessage(`Student ID must not exceed ${LIMITS.STUDENT_ID_MAX} characters.`)
    .matches(/^[A-Z0-9-]+$/i).withMessage('Student ID format is invalid.'),
  handleValidationErrors,
];

const validateIdParam = (paramName) => [
  param(paramName)
    .trim().notEmpty().withMessage(`${paramName} is required.`),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Audit trail query validators
// ────────────────────────────────────────────
const validateAuditTrailQuery = [
  query('entity_type')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('entity_type too long.')
    .escape(),
  query('actor_role')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('actor_role too long.')
    .escape(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('limit must be between 1 and 1000.'),
  handleValidationErrors,
];

// ────────────────────────────────────────────
// Custom date range query validators
// ────────────────────────────────────────────
const validateCustomDateRange = [
  query('dateFrom')
    .optional()
    .isISO8601().withMessage('dateFrom must be a valid date.'),
  query('dateTo')
    .optional()
    .isISO8601().withMessage('dateTo must be a valid date.')
    .custom((value, { req }) => {
      if (req.query.dateFrom && value) {
        if (new Date(req.query.dateFrom) > new Date(value)) {
          throw new Error('dateFrom must be before dateTo.');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validatePatient,
  validateInsertRecord,
  validateAddDiagnosis,
  validateInsertMedicine,
  validateUpdateMedicine,
  validateInsertPersonnel,
  validateAddDisease,
  validateStudentIdParam,
  validateIdParam,
  validateAuditTrailQuery,
  validateCustomDateRange,
  handleValidationErrors,
  LIMITS,
  ENUMS,
};
