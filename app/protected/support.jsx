import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { PageView } from '@/components/Reusable'; // Assuming you have a reusable component for your page view
import { Colors } from '@/constants/Colors';

const support = () => {
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!type || !subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Add logic to handle form submission here (e.g., API request)
    setType('');
    setSubject('');
    setMessage('');
    Alert.alert('Support Message Sent', 'We will get back to you shortly');
  };

  return (
    <PageView title="Support">
      <View style={styles.container}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Enter type of issue"
        />

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Enter subject"
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter your message"
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </PageView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.darkGray,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    fontSize: 14,
    height: 44,
  },
  messageInput: {
    height: 120,
  },
  button: {
    backgroundColor: Colors.pri,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default support;
