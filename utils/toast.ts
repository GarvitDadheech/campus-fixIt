import Toast from 'react-native-toast-message';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Show error toast with validation details
 */
export const showErrorToast = (error: any) => {
  // Check if error has validation errors array
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const validationErrors = error.errors as ValidationError[];
    
    // Format validation errors into a readable message
    const errorMessages = validationErrors.map((err) => {
      const fieldName = err.field.replace('body.', '').replace(/\./g, ' ');
      // Capitalize first letter of field name
      const formattedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
      return `${formattedField}: ${err.message}`;
    });
    
    // Show first error in text2, and all errors in a longer message
    const firstError = errorMessages[0];
    const allErrors = errorMessages.join(' • ');
    
    Toast.show({
      type: 'error',
      text1: 'Validation Failed',
      text2: errorMessages.length === 1 ? firstError : `${firstError} (${errorMessages.length - 1} more)`,
      visibilityTime: 6000,
      topOffset: 60,
      props: {
        // Store full error message for potential expansion
        fullMessage: allErrors,
      },
    });
  } else {
    // Show simple error message
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error?.message || 'An error occurred',
      visibilityTime: 4000,
      topOffset: 60,
    });
  }
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    visibilityTime: 3000,
    topOffset: 60,
  });
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string) => {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    visibilityTime: 3000,
    topOffset: 60,
  });
};

