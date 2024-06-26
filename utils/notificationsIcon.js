import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export const notificationIcon = (type) => {
  switch (type) {
    case 'account':
      return (
        <View
          style={{
            backgroundColor: '#0000CD',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="manage-accounts" size={26} color="white" />
        </View>
      );
    case 'verification':
      return (
        <View
          style={{
            backgroundColor: '#7b0323',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="verified" size={26} color="white" />
        </View>
      );
    case 'report':
      return (
        <View
          style={{
            backgroundColor: '#ff4267',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="report" size={26} color="white" />
        </View>
      );
    case 'blog':
      return (
        <View
          style={{
            backgroundColor: 'black',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <FontAwesome5 name="blogger" size={26} color="white" />
        </View>
      );
    case 'status':
      return (
        <View
          style={{
            backgroundColor: '#52d5ba',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <MaterialIcons
            name="signal-wifi-statusbar-4-bar"
            size={26}
            color="white"
          />
        </View>
      );
    case 'update':
      return (
        <View
          style={{
            backgroundColor: '#0790fe',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="system-update-tv" size={26} color="white" />
        </View>
      );
    case 'alert':
      return (
        <View
          style={{
            backgroundColor: '#ffaf2a',
            padding: 8,
            borderRadius: 12,
          }}
        >
          <Ionicons name="alert-circle" size={26} color="white" />
        </View>
      );
  }
};

const styles = StyleSheet.create({});
