/**
 * validation.js - Runtime Type Checking Utility
 * 
 * This utility provides runtime type checking for objects to ensure
 * data consistency and early error detection in development.
 */

/**
 * Check if a value matches the expected type
 * 
 * @param {*} value - The value to check
 * @param {string} type - Expected type (string, number, boolean, object, array)
 * @param {boolean} required - Whether the value is required
 * @returns {boolean} Whether the value matches the type
 */
const checkType = (value, type, required = true) => {
  if (value === undefined || value === null) {
    return !required;
  }

  switch (type.toLowerCase()) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'function':
      return typeof value === 'function';
    default:
      return false;
  }
};

/**
 * Validate an object against a schema
 * 
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Schema to validate against
 * @returns {Object} Validation result with isValid and errors
 */
export const validateObject = (obj, schema) => {
  const errors = [];

  Object.keys(schema).forEach(key => {
    const rule = schema[key];
    const value = obj[key];

    if (!checkType(value, rule.type, rule.required)) {
      errors.push({
        field: key,
        message: rule.message || `Invalid type for field '${key}'. Expected ${rule.type}.`,
        expected: rule.type,
        received: typeof value,
      });
    }

    // Validate nested objects
    if (rule.type === 'object' && rule.schema && value) {
      const nestedValidation = validateObject(value, rule.schema);
      if (!nestedValidation.isValid) {
        errors.push(...nestedValidation.errors.map(error => ({
          ...error,
          field: `${key}.${error.field}`,
        })));
      }
    }

    // Validate array items
    if (rule.type === 'array' && rule.itemSchema && Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemValidation = validateObject(item, rule.itemSchema);
        if (!itemValidation.isValid) {
          errors.push(...itemValidation.errors.map(error => ({
            ...error,
            field: `${key}[${index}].${error.field}`,
          })));
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Schema for the user object
 */
export const userSchema = {
  id: { type: 'string', required: true },
  name: { type: 'string', required: true },
  email: { type: 'string', required: true },
  phone: { type: 'string', required: true },
  profileImage: { type: 'string', required: false },
  rating: { type: 'number', required: false },
  activeStatus: { type: 'boolean', required: true },
  vehicleDetails: {
    type: 'object',
    required: true,
    schema: {
      type: { type: 'string', required: true },
      plateNumber: { type: 'string', required: true },
      make: { type: 'string', required: true },
      model: { type: 'string', required: true },
      year: { type: 'string', required: true },
    },
  },
};

/**
 * Schema for job objects
 */
export const jobSchema = {
  id: { type: 'string', required: true },
  tracking_id: { type: 'string', required: false },
  companyName: { type: 'string', required: true },
  orderId: { type: 'string', required: true },
  type: { type: 'string', required: true },
  status: { type: 'string', required: true },
  dateTime: { type: 'string', required: true },
  pickupLocation: { type: 'string', required: true },
  dropoffLocation: { type: 'string', required: true },
  profileImage: { type: 'string', required: false },
};

/**
 * Schema for notification objects
 */
export const notificationSchema = {
  id: { type: 'string', required: true },
  title: { type: 'string', required: true },
  message: { type: 'string', required: true },
  read: { type: 'boolean', required: true },
  createdAt: { type: 'string', required: true },
};

/**
 * Schema for dashboard data
 */
export const dashboardSchema = {
  counts: {
    type: 'object',
    required: true,
    schema: {
      new_order: { type: 'number', required: true },
      accepted: { type: 'number', required: true },
      picked_up: { type: 'number', required: true },
      delivered: { type: 'number', required: true },
    },
  },
  new_jobs: {
    type: 'array',
    required: true,
    itemSchema: jobSchema,
  },
};