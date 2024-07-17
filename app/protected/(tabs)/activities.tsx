import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PageView } from '@/components/Reusable';

const Activities = () => {
  return (
    <PageView title={'Activities'} backIcon={false}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You do not have any activity yet</Text>
      </View>
    </PageView>
  );
};

export default Activities;

const styles = StyleSheet.create({});
