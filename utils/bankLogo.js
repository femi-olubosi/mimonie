export const getBankLogo = (bank_name) => {
  if (!bank_name) return require('../assets/banks/default.jpeg');

  const lowerCaseName = bank_name.toLowerCase();

  if (lowerCaseName.includes('access')) {
    return require('../assets/banks/access.png');
  } else if (
    lowerCaseName.includes('gtbank') ||
    lowerCaseName.includes('gt bank') ||
    lowerCaseName.includes('guaranty trust bank')
  ) {
    return require('../assets/banks/gtb.png');
  } else if (lowerCaseName.includes('zenith')) {
    return require('../assets/banks/zenith.png');
  } else if (
    lowerCaseName.includes('uba') ||
    lowerCaseName.includes('united bank for africa')
  ) {
    return require('../assets/banks/uba.png');
  } else if (lowerCaseName.includes('fidelity')) {
    return require('../assets/banks/fidelity.png');
  } else if (
    lowerCaseName.includes('first bank') ||
    lowerCaseName.includes('firstbank') ||
    lowerCaseName.includes('first bank of nigeria')
  ) {
    return require('../assets/banks/first.png');
  } else if (lowerCaseName.includes('sterling')) {
    return require('../assets/banks/sterling.png');
  } else if (lowerCaseName.includes('polaris')) {
    return require('../assets/banks/polaris.png');
  } else if (lowerCaseName.includes('kuda')) {
    return require('../assets/banks/kuda.png');
  } else if (lowerCaseName.includes('paycom')) {
    return require('../assets/banks/paycom.png');
  } else {
    return require('../assets/banks/default.jpeg');
  }
};
