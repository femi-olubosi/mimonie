import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function Completed() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/protected'); // Adjust the path to match your home route
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/616/616489.png',
          }} // Link to a thumbs-up icon
          style={styles.icon}
        />
        <Text style={styles.title}>Success</Text>
        <Text style={styles.message}>Verification Completed Successfully</Text>
        <Text style={styles.subMessage}>
          Your verification is completed successfully and your document is
          approved
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>GO BACK HOME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.pri,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
