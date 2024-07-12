export function isNameIncluded(fullName, targetName) {
  const fullNameParts = fullName.split(' ').map((part) => part.toLowerCase());
  const targetNameParts = targetName
    .split(' ')
    .map((part) => part.toLowerCase());

  // Check if every part of targetNameParts is included in fullNameParts
  return targetNameParts.every((part) => fullNameParts.includes(part));
}
