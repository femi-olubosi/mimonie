export function formatTimestamp(timestamp) {
  // if (!timestamp || !timestamp?.seconds) {
  //   return '';
  // }
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleString();
}
