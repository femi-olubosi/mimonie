export function formatTimestamp(timestamp) {
  // if (!timestamp || !timestamp?.seconds) {
  //   return '';
  // }
  const date = new Date(timestamp);
  return date.toLocaleString();
}
