import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { View } from 'react-native';

export const notificationIcon = (type) => {
  switch (type) {
    case 'account':
      return (
        <View
          style={{
            backgroundColor: '#0000CD',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="manage-accounts" size={20} color="white" />
        </View>
      );
    case 'verification':
      return (
        <View
          style={{
            backgroundColor: '#7b0323',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="verified" size={20} color="white" />
        </View>
      );
    case 'report':
      return (
        <View
          style={{
            backgroundColor: '#ff4267',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="report" size={20} color="white" />
        </View>
      );
    case 'blog':
      return (
        <View
          style={{
            backgroundColor: 'black',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <FontAwesome5 name="blogger" size={20} color="white" />
        </View>
      );
    case 'status':
      return (
        <View
          style={{
            backgroundColor: '#52d5ba',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <MaterialIcons
            name="signal-wifi-statusbar-4-bar"
            size={20}
            color="white"
          />
        </View>
      );
    case 'update':
      return (
        <View
          style={{
            backgroundColor: '#0790fe',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <MaterialIcons name="system-update-tv" size={20} color="white" />
        </View>
      );
    case 'alert':
      return (
        <View
          style={{
            backgroundColor: '#ffaf2a',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <Ionicons name="alert-circle" size={20} color="white" />
        </View>
      );
    case 'card':
      return (
        <View
          style={{
            backgroundColor: '#90EE90',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <Entypo name="credit-card" size={20} color="white" />
        </View>
      );
    case 'reminder':
      return (
        <View
          style={{
            backgroundColor: '#FFA500',
            padding: 6,
            borderRadius: 12,
          }}
        >
          <Ionicons name="alarm" size={20} color="white" />
        </View>
      );
  }
};
