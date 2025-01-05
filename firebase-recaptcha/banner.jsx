import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

export default function FirebaseRecaptchaBanner(props) {
  const { textStyle, linkStyle, ...otherProps } = props;
  return (
    <View {...otherProps}>
      <Text style={[styles.text, textStyle]}>
        This app is protected by reCAPTCHA and the Google
        <Text
          style={[styles.link, linkStyle]}
          onPress={() => Linking.openURL('https://policies.google.com/privacy')}
        >
          &nbsp;Privacy Policy&nbsp;
        </Text>
        and
        <Text
          style={[styles.link, linkStyle]}
          onPress={() => Linking.openURL('https://policies.google.com/terms')}
        >
          &nbsp;Terms of Service&nbsp;
        </Text>
        apply.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    fontSize: 13,
    opacity: 0.5,
  },
  link: {
    color: 'blue',
  },
});
