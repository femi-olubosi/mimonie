import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const CopyLink = ({ inviteLink }) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(
      `https://mimonie.net/protected/mimonie/${inviteLink}`
    );
  };

  return (
    <View style={{ maxHeight: 50 }}>
      <TouchableOpacity
        onPress={handleCopy}
        style={{
          alignSelf: 'flex-end',
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          flexDirection: 'row',
          columnGap: 4,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'black' }}>Copy link</Text>
        <Feather name="copy" size={14} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default CopyLink;
