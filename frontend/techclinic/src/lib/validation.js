/**
 * Shared validation rules & helpers for TechClinic.
 * Used across all frontend forms to enforce consistent, enterprise-grade validation.
 */

// ────────────────────────────────────────────
// Regex patterns
// ────────────────────────────────────────────
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CONTACT: /^[0-9+\-() ]{7,15}$/,
  STUDENT_ID: /^[A-Z0-9-]+$/i,
  ALPHA_SPACE: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,         // names (inc. accented chars)
  ALPHANUMERIC: /^[A-Za-z0-9\s\-/]+$/,                // batch numbers, dosage
  DOSAGE: /^[A-Za-z0-9.\-/\s]+$/,                     // e.g. "500mg", "10 mg/mL"
  NO_SCRIPT_TAGS: /<\s*script[\s>]|javascript\s*:/i,   // XSS guard
};

// ────────────────────────────────────────────
// Length limits (mirrored in backend)
// ────────────────────────────────────────────
export const LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 6,
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
  FILE_MAX_SIZE_MB: 5,
  HEIGHT_MIN: 50,
  HEIGHT_MAX: 300,
  WEIGHT_MIN: 1,
  WEIGHT_MAX: 500,
};

// ────────────────────────────────────────────
// Allowed enums
// ────────────────────────────────────────────
export const ENUMS = {
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
  MEDICINE_TYPE: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Other'],
};

// ────────────────────────────────────────────
// Sanitisation helper – prevent XSS
// ────────────────────────────────────────────
export function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Strip tags only (for display) */
export function stripTags(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '');
}

/** Check if value contains potential XSS */
export function containsXSS(value) {
  if (typeof value !== 'string') return false;
  return PATTERNS.NO_SCRIPT_TAGS.test(value);
}

// ────────────────────────────────────────────
// Field validators – return error string or ''
// ────────────────────────────────────────────

export function validateRequired(value, label = 'This field') {
  if (value === null || value === undefined) return `${label} is required.`;
  if (typeof value === 'string' && !value.trim()) return `${label} is required.`;
  return '';
}

export function validateEmail(value) {
  const req = validateRequired(value, 'Email');
  if (req) return req;
  if (value.length > LIMITS.EMAIL_MAX) return `Email must not exceed ${LIMITS.EMAIL_MAX} characters.`;
  if (!PATTERNS.EMAIL.test(value)) return 'Please enter a valid email address.';
  if (containsXSS(value)) return 'Invalid characters detected.';
  return '';
}

export function validatePassword(value, { minLen = LIMITS.PASSWORD_MIN, requireStrength = false } = {}) {
  const req = validateRequired(value, 'Password');
  if (req) return req;
  if (value.length < minLen) return `Password must be at least ${minLen} characters.`;
  if (value.length > LIMITS.PASSWORD_MAX) return `Password must not exceed ${LIMITS.PASSWORD_MAX} characters.`;
  if (requireStrength) {
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character.';
  }
  return '';
}

export function validateName(value, label = 'Name') {
  const req = validateRequired(value, label);
  if (req) return req;
  const trimmed = value.trim();
  if (trimmed.length < LIMITS.NAME_MIN) return `${label} is required.`;
  if (trimmed.length > LIMITS.NAME_MAX) return `${label} must not exceed ${LIMITS.NAME_MAX} characters.`;
  if (!PATTERNS.ALPHA_SPACE.test(trimmed)) return `${label} may only contain letters, spaces, hyphens, and apostrophes.`;
  if (containsXSS(value)) return 'Invalid characters detected.';
  return '';
}

export function validateStudentId(value) {
  const req = validateRequired(value, 'Student ID');
  if (req) return req;
  const trimmed = value.trim();
  if (trimmed.length > LIMITS.STUDENT_ID_MAX) return `Student ID must not exceed ${LIMITS.STUDENT_ID_MAX} characters.`;
  if (!PATTERNS.STUDENT_ID.test(trimmed)) return 'Student ID may only contain letters, numbers, and hyphens.';
  return '';
}

export function validateContact(value) {
  const req = validateRequired(value, 'Contact number');
  if (req) return req;
  const trimmed = value.trim();
  if (trimmed.length < LIMITS.CONTACT_MIN) return `Contact number must be at least ${LIMITS.CONTACT_MIN} characters.`;
  if (trimmed.length > LIMITS.CONTACT_MAX) return `Contact number must not exceed ${LIMITS.CONTACT_MAX} characters.`;
  if (!PATTERNS.CONTACT.test(trimmed)) return 'Contact number may only contain digits, +, -, ( ), and spaces.';
  return '';
}

export function validateAddress(value) {
  // Address is often optional; only validate if non-empty
  if (!value || !value.trim()) return '';
  if (value.trim().length > LIMITS.ADDRESS_MAX) return `Address must not exceed ${LIMITS.ADDRESS_MAX} characters.`;
  if (containsXSS(value)) return 'Invalid characters detected.';
  return '';
}

export function validateDateOfBirth(value) {
  const req = validateRequired(value, 'Date of birth');
  if (req) return req;
  const dob = new Date(value);
  if (isNaN(dob.getTime())) return 'Please enter a valid date.';
  const today = new Date();
  if (dob >= today) return 'Date of birth must be in the past.';
  const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
  if (age > 150) return 'Please enter a valid date of birth.';
  return '';
}

export function validateEnum(value, allowed, label = 'Selection') {
  const req = validateRequired(value, label);
  if (req) return req;
  if (!allowed.includes(value)) return `${label} must be one of: ${allowed.join(', ')}.`;
  return '';
}

export function validateMedicineName(value) {
  const req = validateRequired(value, 'Medicine name');
  if (req) return req;
  const trimmed = value.trim();
  if (trimmed.length > LIMITS.MEDICINE_NAME_MAX) return `Medicine name must not exceed ${LIMITS.MEDICINE_NAME_MAX} characters.`;
  if (containsXSS(value)) return 'Invalid characters detected.';
  return '';
}

export function validateOptionalText(value, label, maxLen) {
  if (!value || !value.trim()) return '';
  if (value.trim().length > maxLen) return `${label} must not exceed ${maxLen} characters.`;
  if (containsXSS(value)) return 'Invalid characters detected.';
  return '';
}

export function validateStock(value) {
  if (value === '' || value === null || value === undefined) return 'Stock level is required.';
  const num = Number(value);
  if (isNaN(num)) return 'Stock level must be a number.';
  if (!Number.isInteger(num)) return 'Stock level must be a whole number.';
  if (num < LIMITS.STOCK_MIN) return 'Stock level cannot be negative.';
  if (num > LIMITS.STOCK_MAX) return `Stock level must not exceed ${LIMITS.STOCK_MAX}.`;
  return '';
}

export function validateExpiryDate(value) {
  const req = validateRequired(value, 'Expiry date');
  if (req) return req;
  const expiry = new Date(value);
  if (isNaN(expiry.getTime())) return 'Please enter a valid date.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (expiry < today) return 'Expiry date must be in the future.';
  return '';
}

export function validateBatch(value) {
  if (!value || !value.trim()) return 'Batch number is required.';
  const trimmed = value.trim();
  if (trimmed.length > LIMITS.BATCH_MAX) return `Batch number must not exceed ${LIMITS.BATCH_MAX} characters.`;
  if (!PATTERNS.ALPHANUMERIC.test(trimmed)) return 'Batch number may only contain letters, numbers, hyphens, and slashes.';
  return '';
}

export function validateDosage(value) {
  if (!value || !value.trim()) return 'Dosage is required.';
  const trimmed = value.trim();
  if (trimmed.length > LIMITS.DOSAGE_MAX) return `Dosage must not exceed ${LIMITS.DOSAGE_MAX} characters.`;
  if (!PATTERNS.DOSAGE.test(trimmed)) return 'Dosage contains invalid characters.';
  return '';
}

export function validateUnit(value) {
  if (!value || !value.trim()) return 'Unit of measure is required.';
  if (value.trim().length > LIMITS.UNIT_MAX) return `Unit must not exceed ${LIMITS.UNIT_MAX} characters.`;
  return '';
}

export function validateQuantity(value, maxStock) {
  if (value === '' || value === null || value === undefined) return 'Quantity is required.';
  const num = Number(value);
  if (isNaN(num)) return 'Quantity must be a number.';
  if (!Number.isInteger(num)) return 'Quantity must be a whole number.';
  if (num < 1) return 'Quantity must be at least 1.';
  if (maxStock !== undefined && num > maxStock) return `Quantity cannot exceed available stock (${maxStock}).`;
  return '';
}

export function validateTreatment(value) {
  return validateOptionalText(value, 'Treatment', LIMITS.TREATMENT_MAX);
}

export function validateNotes(value) {
  return validateOptionalText(value, 'Notes', LIMITS.NOTES_MAX);
}

export function validateSearch(value) {
  if (!value) return '';
  if (value.length > LIMITS.SEARCH_MAX) return `Search query must not exceed ${LIMITS.SEARCH_MAX} characters.`;
  if (containsXSS(value)) return 'Invalid characters in search.';
  return '';
}

export function validateExcusedDays(value) {
  if (!value && value !== 0) return '';
  const num = Number(value);
  if (isNaN(num)) return 'Excused days must be a number.';
  if (!Number.isInteger(num)) return 'Excused days must be a whole number.';
  if (num < 0) return 'Excused days cannot be negative.';
  if (num > LIMITS.EXCUSED_DAYS_MAX) return `Excused days must not exceed ${LIMITS.EXCUSED_DAYS_MAX}.`;
  return '';
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Please enter valid dates.';
  if (start > end) return 'Start date must be before end date.';
  const today = new Date();
  if (start > today) return 'Start date cannot be in the future.';
  return '';
}

export function validateFileUpload(file, { maxSizeMB = LIMITS.FILE_MAX_SIZE_MB, allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] } = {}) {
  if (!file) return '';
  if (!allowedTypes.includes(file.type)) return `File type not allowed. Accepted: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}.`;
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) return `File size must not exceed ${maxSizeMB}MB.`;
  return '';
}

export function validateDiseaseName(value) {
  const req = validateRequired(value, 'Disease name');
  if (req) return req;
  const trimmed = value.trim();
  if (trimmed.length > LIMITS.DISEASE_NAME_MAX) return `Disease name must not exceed ${LIMITS.DISEASE_NAME_MAX} characters.`;
  if (containsXSS(value)) return 'Invalid characters detected.';
  return '';
}

export function validateHeight(value) {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return 'Height must be a number.';
  if (num < LIMITS.HEIGHT_MIN || num > LIMITS.HEIGHT_MAX) return `Height must be between ${LIMITS.HEIGHT_MIN} and ${LIMITS.HEIGHT_MAX} cm.`;
  return '';
}

export function validateWeight(value) {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return 'Weight must be a number.';
  if (num < LIMITS.WEIGHT_MIN || num > LIMITS.WEIGHT_MAX) return `Weight must be between ${LIMITS.WEIGHT_MIN} and ${LIMITS.WEIGHT_MAX} kg.`;
  return '';
}

// ────────────────────────────────────────────
// Form-level validators — validate full forms
// ────────────────────────────────────────────

export function validateMedicineForm(data) {
  return {
    name: validateMedicineName(data.name || data.medicine_name),
    generic: validateOptionalText(data.generic || data.generic_name, 'Generic name', LIMITS.GENERIC_NAME_MAX),
    brand: validateOptionalText(data.brand, 'Brand', LIMITS.BRAND_MAX),
    type: validateOptionalText(data.type, 'Type', LIMITS.TYPE_MAX),
    dosage: validateDosage(data.dosage),
    unit: validateUnit(data.unit || data.unit_of_measure),
    stock: validateStock(data.stock ?? data.stock_level),
    batch: validateBatch(data.batch || data.batch_number),
    expiry: validateExpiryDate(data.expiry || data.expiry_date),
  };
}

export function validatePersonnelForm(data) {
  return {
    first_name: validateName(data.first_name, 'First name'),
    last_name: validateName(data.last_name, 'Last name'),
    email: validateEmail(data.email),
    address: validateAddress(data.address),
    date_of_birth: validateDateOfBirth(data.date_of_birth),
    role: validateEnum(data.role, ENUMS.ROLE, 'Role'),
    sex: validateEnum(data.sex, ENUMS.SEX, 'Sex'),
  };
}

export function validatePatientForm(data) {
  return {
    studentId: validateStudentId(data.studentId),
    firstName: validateName(data.firstName, 'First name'),
    lastName: validateName(data.lastName, 'Last name'),
    email: validateEmail(data.email),
    contactNumber: validateContact(data.contactNumber),
    address: validateAddress(data.address),
    dateOfBirth: validateDateOfBirth(data.dateOfBirth),
    sex: validateEnum(data.sex, ENUMS.SEX, 'Sex'),
    department: validateEnum(data.department, ENUMS.DEPARTMENT, 'Department'),
    yearLevel: data.yearLevel ? validateEnum(data.yearLevel, ENUMS.YEAR_LEVEL, 'Year level') : '',
    height: validateHeight(data.height),
    weight: validateWeight(data.weight),
  };
}

/** Returns true if errors object has any non-empty values */
export function hasErrors(errorsObj) {
  return Object.values(errorsObj).some(e => e !== '');
}
