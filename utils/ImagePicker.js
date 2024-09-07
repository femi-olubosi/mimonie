import * as ImagePicker from 'expo-image-picker';

export const imagePicker = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
};
