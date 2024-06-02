import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import Button from '../../../components/Button';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';

const Account = () => {
  const { signOut } = useAuthenticator();
  const router = useRouter();

  const handleInviteFriends = () => {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      <View
        style={{ flex: 1, justifyContent: 'center', backgroundColor: 'gray' }}
      >
        <View style={{ backgroundColor: '#F0F9FF', flex: 1, padding: 20 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Link href={'/protected/personal_info'}>
              <AntDesign name="edit" size={20} color="black" />
            </Link>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 100,
                backgroundColor: '#ED7D2D',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <FontAwesome name="user-o" size={34} color="white" />
            </View>
            <Text style={{ color: '#424856', fontSize: 18, fontFamily: 'er' }}>
              {'Jimoh Ibrahim'}
            </Text>
            <Text
              style={{
                color: '#424856',
                fontSize: 14,
                fontFamily: 'er',
                marginTop: 10,
              }}
            >
              {'********'}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: 'white', flex: 2, padding: 20 }}>
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemContainer}
                onPress={() => router.push(item.route)}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {item.icon}
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="black" />
              </TouchableOpacity>
            ))}
            <Button
              title={'Invite Friends'}
              color={Colors.pri}
              onPress={handleInviteFriends}
              outline={true}
            />
            <Button
              title={'Sign Out'}
              color={'red'}
              onPress={() => signOut()}
              outline={false}
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
  },
  itemText: {
    marginLeft: 16,
    fontSize: 16,
  },
});

const menuItems = [
  {
    title: 'Personal Information',
    icon: <Ionicons name="person-outline" size={24} color="black" />,
    route: '/protected/personal_info',
  },
  {
    title: 'Cards management',
    icon: <AntDesign name="idcard" size={24} color="black" />,
    route: '/cards_management',
  },
  {
    title: 'Privacy & Security',
    icon: <MaterialIcons name="security" size={24} color="black" />,
    route: '/privacy_security',
  },
  {
    title: 'Support',
    icon: <MaterialIcons name="support-agent" size={24} color="black" />,
    route: '/support',
  },
];
