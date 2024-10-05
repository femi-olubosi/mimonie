// Function to check if a value is a Float
export const isFloat = (value) => {
  return (
    !isNaN(value) &&
    parseFloat(value) == value &&
    value.toString().indexOf('.') != -1
  );
};

// Function to check if a value is an Integer
export const isInt = (value) => {
  return (
    !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !value.toString().includes('.')
  );
};

// Function to check if a value is a Decimal (includes both float and integer)
export const isDecimal = (value) => {
  return !isNaN(value) && parseFloat(value) == value;
};

export const toFloat = (value) => {
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? null : parsedValue;
};

// Function to convert a value to Integer
export const toInt = (value) => {
  const parsedValue = parseInt(value);
  return isNaN(parsedValue) ? null : parsedValue;
};
