import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import { PageView } from '@/components/Reusable';

const help = () => {
    const { slug } = useLocalSearchParams();

  return (
    <PageView title={slug}>
      <View style={styles.container}>
      <Text>{slug}</Text>
      </View>
    </PageView>
  )
}

export default help

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
      },
})