import { View, TextInput, Keyboard, StyleSheet } from 'react-native';
import React, { useRef } from 'react';

const PinInput = ({ pin, setPin }) => {
  const pinRefs = useRef([]);

  const handlePinChange = (value, index) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      pinRefs.current[index + 1].focus();
    }
  };
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && pin[index] === '' && index > 0) {
      pinRefs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.pinContainer}>
      {pin.map((digit, index) => (
        <TextInput
          key={index}
          style={styles.pinInput}
          value={digit}
          onChangeText={(value) => handlePinChange(value, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          ref={(ref) => (pinRefs.current[index] = ref)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          onPress={Keyboard.dismiss}
        />
      ))}
    </View>
  );
};

export default PinInput;

const styles = StyleSheet.create({
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: 50,
    height: 50,
    fontSize: 24,
    textAlign: 'center',
  },
});
