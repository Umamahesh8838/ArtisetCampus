/**
 * Registration validation helper
 * Provides validation functions for all registration sections with error messages
 */

const validateBasic = (basic) => {
  const errors = [];
  
  if (!basic) {
    errors.push('Basic details are required');
    return errors;
  }

  // Salutation is required
  if (!basic.salutation || basic.salutation.trim() === '') {
    errors.push('Salutation is required');
  }

  // First name is required
  if (!basic.firstName || basic.firstName.trim() === '') {
    errors.push('First name is required');
  }

  // Last name is required
  if (!basic.lastName || basic.lastName.trim() === '') {
    errors.push('Last name is required');
  }

  // Email is required
  if (!basic.email || basic.email.trim() === '') {
    errors.push('Email is required');
  }

  // Contact number is required
  if (!basic.contactNumber || basic.contactNumber.trim() === '') {
    errors.push('Contact number is required');
  }

  // Gender is required
  if (!basic.gender || basic.gender.trim() === '') {
    errors.push('Gender is required');
  }

  return errors;
};

const validateCollege = (college) => {
  const errors = [];
  
  if (!college) {
    return errors; // College is optional section
  }

  // If college is provided, at least college name is required
  if (college.college && college.college.trim() !== '') {
    // If college is filled, CGPA or Percentage must be provided
    const cgpa = college.cgpa ? parseFloat(college.cgpa) : null;
    const percentage = college.percentage ? parseFloat(college.percentage) : null;

    if ((cgpa === null || cgpa === '') && (percentage === null || percentage === '')) {
      errors.push('Enter CGPA or Percentage for your college education');
    }
  }

  return errors;
};

const validateCertifications = (certifications) => {
  const errors = [];
  
  if (!Array.isArray(certifications)) {
    return errors;
  }

  certifications.forEach((cert, idx) => {
    if (cert.name && cert.name.trim() !== '') {
      // If certification name is provided, organization is required
      if (!cert.organization || cert.organization.trim() === '') {
        errors.push(`Issuing organization is required for certification "${cert.name}"`);
      }
    }
  });

  return errors;
};

const validateLanguages = (languages) => {
  const errors = [];
  
  if (!Array.isArray(languages) || languages.length === 0) {
    errors.push('Add at least one language');
  } else {
    // Check if array has at least one non-empty item
    const hasValid = languages.some(lang => {
      if (typeof lang === 'string') return lang.trim() !== '';
      return lang && lang.name && lang.name.trim() !== '';
    });
    
    if (!hasValid) {
      errors.push('Add at least one language');
    }
  }

  return errors;
};

const validateInterests = (interests) => {
  const errors = [];
  
  if (!Array.isArray(interests) || interests.length === 0) {
    errors.push('Add at least one interest');
  } else {
    // Check if array has at least one non-empty item
    const hasValid = interests.some(interest => {
      if (typeof interest === 'string') return interest.trim() !== '';
      return interest && interest.name && interest.name.trim() !== '';
    });
    
    if (!hasValid) {
      errors.push('Add at least one interest');
    }
  }

  return errors;
};

/**
 * Validate entire registration draft before submission
 * Returns object with validation result and error messages
 */
const validateRegistrationDraft = (draft) => {
  const allErrors = [];

  // Basic validation (mandatory)
  allErrors.push(...validateBasic(draft.basic));

  // College validation
  allErrors.push(...validateCollege(draft.college));

  // Certifications validation
  allErrors.push(...validateCertifications(draft.certifications));

  // Languages validation (mandatory)
  allErrors.push(...validateLanguages(draft.languages));

  // Interests validation (mandatory)
  allErrors.push(...validateInterests(draft.interests));

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    errorMessage: allErrors.length > 0 ? allErrors.join('; ') : null
  };
};

module.exports = {
  validateBasic,
  validateCollege,
  validateCertifications,
  validateLanguages,
  validateInterests,
  validateRegistrationDraft
};
