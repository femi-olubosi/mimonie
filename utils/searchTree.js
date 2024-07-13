export function searchTree(obj, key) {
  const results = [];
  if (typeof obj === 'object') {
    if (key in obj && obj[key] !== null) {
      if (obj.FullName && obj.DOB) {
        results.push({ FullName: obj.FullName, DOB: obj.DOB });
      }
    }
    for (let prop in obj) {
      const result = searchTree(obj[prop], key);
      if (Array.isArray(result)) {
        results.push(...result);
      } else if (result) {
        results.push(result);
      }
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = searchTree(obj[i], key);
      if (Array.isArray(result)) {
        results.push(...result);
      } else if (result) {
        results.push(result);
      }
    }
  }
  return results;
}
