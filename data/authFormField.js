export const formFields = {
  signUp: {
    username: {
      labelHidden: false,
      isRequired: true,
      order: 1,
    },
    email: {
      labelHidden: false,
      isRequired: true,
      order: 2,
    },
    password: {
      isRequired: true,
      order: 3,
    },
  },
  forgotPassword: {
    username: {
      labelHidden: false,
      placeholder: 'Enter your email address',
      isRequired: true,
      label: 'Email Address:',
    },
  },
};
