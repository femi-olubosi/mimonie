export const validateField = (key, value) => {
  let errorMessage = '';
  switch (key) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = 'Please enter a valid email address.';
      } else {
        const domainMatch = value.toLowerCase().match(/@([^@]+)$/);
        const domain = domainMatch ? domainMatch[1] : '';

        const baseDomains = ['gmail', 'yahoo', 'hotmail'];

        const domainParts = domain.split('.');
        const base = domainParts[0];
        const tld = domainParts[1];

        if (baseDomains.includes(base) && tld !== 'com') {
          errorMessage = `Only ${base}.com addresses are allowed.`;
        }
      }
      break;
    case 'password':
      if (!value) {
        errorMessage = 'Password is required.';
      } else {
        if (value.length < 6) {
          errorMessage += 'Password must be at least 6 characters long. ';
        }
        if (!/[A-Z]/.test(value)) {
          errorMessage +=
            'Password must contain at least one uppercase letter. ';
        }
        if (!/[a-z]/.test(value)) {
          errorMessage +=
            'Password must contain at least one lowercase letter. ';
        }
        if (!/\d/.test(value)) {
          errorMessage += 'Password must contain at least one digit. ';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errorMessage +=
            'Password must contain at least one special character. ';
        }
      }
      break;
    case 'username':
      if (value.length < 3) {
        errorMessage = 'Username must be at least 3 characters long.';
      }
      break;
    case 'phone_number':
      const nigeriaPhoneRegex = /^\+234\d{10}$/;

      if (!nigeriaPhoneRegex.test(value)) {
        errorMessage =
          'Please enter a valid Nigerian phone number (e.g., +2348012345678).';
      }
      break;
    case 'accountNumber':
      if (!/^\d{10}$/.test(value)) {
        errorMessage = 'Account number must be exactly 10 digits long.';
      }
      break;
    case 'bvn':
      if (!/^\d{11}$/.test(value)) {
        errorMessage = 'BVN must be exactly 11 digits long.';
      }
      break;
    case 'name':
      if (!value) {
        errorMessage = 'Fields are required';
        console.log(value);
      }
      break;
    case 'address':
      if (!value) {
        errorMessage = 'Home address is required.';
      } else {
        const addressRegex = /^[a-zA-Z0-9\s,.'-]{15,}$/;
        if (!addressRegex.test(value)) {
          errorMessage = 'Please enter your complete valid address';
        }
      }
      break;
    case `${key}`:
      if (!value) {
        errorMessage = 'Fields are required';
        console.log(value);
      }
      break;
    default:
      errorMessage = 'Fields are required';
      break;
  }
  return errorMessage;
};

export const validateFormData = (data) => {
  const newErrors = {};
  if (Object.keys(data || {}).length < 1) {
    newErrors['error'] = 'All fields is required';
  }
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const errorMessage = validateField(key, data[key]);
      if (errorMessage) {
        newErrors[key] = errorMessage;
      }
    }
  }
  return newErrors;
};
