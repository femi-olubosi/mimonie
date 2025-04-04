import { StyleSheet, View } from 'react-native';
import React from 'react';
import { SkeletonLoader } from '@/components/Reusable';

const SkeletonLoaderComp = () => {
  return (
    <View style={{ rowGap: 6 }}>
      <View style={{ marginVertical: 10 }}>
        <SkeletonLoader width="100%" height={20} />
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="80%" height={20} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <SkeletonLoader width="100%" height={20} />
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="80%" height={20} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <SkeletonLoader width="100%" height={20} />
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="80%" height={20} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <SkeletonLoader width="100%" height={20} />
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="80%" height={20} />
      </View>
    </View>
  );
};

export default SkeletonLoaderComp;

const styles = StyleSheet.create({});
