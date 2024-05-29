// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from '@expo/vector-icons/Ionicons';

export function TabBarIcon({ name, material = false, color, style = {} }) {
  return (
    <>
      {material ? (
        <Ionicons
          name={name}
          size={28}
          style={[{ marginBottom: -3 }, style]}
          color={color}
        />
      ) : (
        <Ionicons
          name={name}
          size={28}
          style={[{ marginBottom: -3 }, style]}
          color={color}
        />
      )}
    </>
  );
}
