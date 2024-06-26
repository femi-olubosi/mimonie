export const getBankLogo = (bank_name) => {
  switch (bank_name?.toLowerCase()) {
    case 'access':
    case 'access bank':
      return require('../assets/banks/access.png');
    case 'gtbank':
    case 'gt bank':
    case 'guaranty trust bank':
      return require('../assets/banks/gtb.png');
    case 'zenith':
    case 'zenith bank':
      return require('../assets/banks/zenith.png');
    case 'uba':
    case 'united bank for africa':
      return require('../assets/banks/uba.png');
    case 'fidelity':
    case 'fidelity bank':
      return require('../assets/banks/fidelity.png');
    case 'first bank':
    case 'firstbank':
    case 'first bank of nigeria':
      return require('../assets/banks/first.png');
    // case 'fcmb':
    // case 'first city monument bank':
    //   return require('../assets/banks/fcmb.png');
    // case 'union bank':
    //   return require('../assets/banks/union.png');
    case 'sterling':
    case 'sterling bank':
      return require('../assets/banks/sterling.png');
    // case 'stanbic ibtc':
    // case 'stanbic':
    //   return require('../assets/banks/stanbic.png');
    // case 'ecobank':
    //   return require('../assets/banks/ecobank.png');
    // case 'wema':
    // case 'wema bank':
    //   return require('../assets/banks/wema.png');
    // case 'keystone':
    // case 'keystone bank':
    //   return require('../assets/banks/keystone.png');
    // case 'unity':
    // case 'unity bank':
    //   return require('../assets/banks/unity.png');
    case 'polaris':
    case 'polaris bank':
      return require('../assets/banks/polaris.png');
    default:
      return require('../assets/banks/default.jpeg');
  }
};
