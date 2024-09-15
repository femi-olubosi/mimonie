import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { PageView } from '../../components/Reusable';
import { Feather } from '@expo/vector-icons';
import { faqData } from '../../model/faq';

const faq = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <PageView title={'FAQs'}>
      <View style={{ padding: 20 }}>
        <ScrollView style={styles.container}>
          <Text style={styles.header}>Frequently Asked Questions</Text>
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>
                {index + 1}. {item.question}
              </Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </PageView>
  );
};

export default faq;

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  answerContainer: {
    marginTop: 10,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  faqItem: {
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    lineHeight: 20,
  },
});
