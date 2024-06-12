export const statusCheck = (status) => {
  switch (status) {
    case 'open':
      return 'green';
    case 'running':
      return 'blue';
    case 'closed':
      return 'red';
    case 'locked':
      return 'grey';
    default:
      return 'black';
  }
};
