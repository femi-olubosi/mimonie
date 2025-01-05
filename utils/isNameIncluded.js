export function isNameIncluded(fullName, targetName) {
  const fullNameParts = fullName.split(' ').map((part) => part.toLowerCase());
  const targetNameParts = targetName
    .split(' ')
    .map((part) => part.toLowerCase());

  // Check if every part of targetNameParts is included in fullNameParts
  return targetNameParts.every((part) => fullNameParts.includes(part));
}

export function isNameAndDobIncluded(data, targetName, targetDob) {
  const targetNameParts = targetName
    .split(' ')
    .map((part) => part.toLowerCase());
  return data.some((item) => {
    if (item.DOB === targetDob) {
      const fullNameParts = item.FullName.split(' ').map((part) =>
        part.toLowerCase()
      );

      return targetNameParts.every((part) => fullNameParts.includes(part));
    }
    return false;
  });
}
