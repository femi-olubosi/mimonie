import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';

const CopyLink = ({ inviteLink }) => {
  const webViewRef = useRef(null);

  const handleCopy = () => {
    const jsCode = `
      (function() {
        const textArea = document.createElement('textarea');
        textArea.value = 'https://mimonie.net/protected/mimonie/${inviteLink}';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        window.ReactNativeWebView.postMessage('Invite link copied to clipboard!');
      })();
    `;
    webViewRef.current.injectJavaScript(jsCode);
  };

  return (
    <View style={{ height: 50 }}>
      <TouchableOpacity
        onPress={handleCopy}
        style={{
          alignSelf: 'flex-end',
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginBottom: 10,
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

      {/* Hidden WebView for Clipboard Access */}
      <WebView
        ref={webViewRef}
        style={{ display: 'none' }}
        originWhitelist={['*']}
        source={{ html: '<html><body></body></html>' }}
        onMessage={(event) => {
          alert(event.nativeEvent.data);
        }}
      />
    </View>
  );
};

export default CopyLink;
