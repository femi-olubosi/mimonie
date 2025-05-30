import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

const SupportPage = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Need Help?</Text>

      {[
        {
          label: 'Account Setup',
          route: `/protected/help/Account Help`,
        },
        {
          label: 'Managing Group Contributions',
          route: '/protected/help/Group Contributions Help',
        },
        {
          label: 'Managing Personal Contributions',
          route: '/protected/help/Personal Contributions Help',
        },
        {
          label: 'Verifications',
          route: '/protected/help/Verification Help',
        },
        {
          label: 'Troubleshooting',
          route: '/protected/help/Troubleshooting Help',
        },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.helpButton}
          onPress={() => router.push(item.route)}
        >
          <Text style={styles.modalText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SupportPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: Colors.pri,
  },
  helpButton: {
    backgroundColor: Colors.pri,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 10,
    borderRadius: 8,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeText: {
    marginTop: 20,
    color: Colors.pri,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
