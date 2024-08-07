export const statusCheck = (status) => {
  switch (status) {
    case 'open':
      return '#FFC107';
    case 'running':
      return '#28a745';
    case 'closed':
      return '#dc3545';
    case 'locked':
      return '#6c757d';
    case 'completed':
      return '#17a2b8';
    default:
      return '#000000';
  }
};
