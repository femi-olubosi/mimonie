// Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, color, outline, styleOverride = {} }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: outline ? 'transparent' : color,
          borderColor: color,
        },
        outline && styles.outline,
        { ...styleOverride },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: outline ? color : '#fff' }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'ib',
  },
  outline: {
    backgroundColor: 'transparent',
  },
});

export default Button;
