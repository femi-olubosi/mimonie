export function convertToAWSDate(dateString) {
  // Parse the input date string
  const [month, day, year] = dateString?.split('/');

  // Create a new Date object using the parsed values
  const date = new Date(year, month - 1, day);

  // Convert to AWSDate format using toLocaleDateString
  const awsDate = date.toLocaleDateString('en-CA'); // en-CA format is YYYY-MM-DD

  return awsDate;
}
