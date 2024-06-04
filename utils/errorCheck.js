import { Alert } from 'react-native';
import { validateFormData } from './validator';

export const ErrorCheck = (formData) => {
  const errMsg = validateFormData(formData);

  if (Object.keys(errMsg).length > 0) {
    const errorMessages = Object.keys(errMsg || {})
      .map((key) => `${key}: ${errMsg[key]}`)
      .join('\n');
    Alert.alert('Validation Errors', errorMessages);
    return true;
  }
};
