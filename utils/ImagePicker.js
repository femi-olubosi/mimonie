import * as ImagePicker from 'expo-image-picker';

export const imagePicker = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.2,
  });

  if (!result.canceled) {
    return result.assets[0];
  }
};
