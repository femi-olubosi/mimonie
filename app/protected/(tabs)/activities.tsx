import { SafeAreaView, StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PageView } from '@/components/Reusable';
import { fetchUserActivities } from '@/api/activities.service';
import { useGlobalContext } from '@/store/StoreContext';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { naira } from '@/constants/Currency';
import { formatTimestamp } from '@/utils/formatTimestamp';
import Hide from '@/components/Hide';

const Activities = () => {
  const { userProfile, userActivities, setUserActivities, hideValues } =
    useGlobalContext();

  useEffect(() => {
    (async () => {
      await fetchUserActivities(userProfile.userId, setUserActivities);
    })();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 74,
        borderColor: '#DEE1E6',
        width: '100%',
        gap: 20,
        padding: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          columnGap: 10,
          alignItems: 'start',
        }}
      >
        {item.description.includes('Failed') ? (
          <MaterialIcons name="block" size={24} color="red" />
        ) : item.type === 'collection' ? (
          <MaterialCommunityIcons
            name="arrow-bottom-right-thin-circle-outline"
            size={24}
            color="green"
          />
        ) : (
          <MaterialCommunityIcons
            name="arrow-top-left-thin-circle-outline"
            size={24}
            color="red"
          />
        )}
        <View
          style={{
            flex: 1,
            rowGap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'ir',
              color: item.description.includes('Failed') ? 'red' : 'gray',
            }}
          >
            {item.description.includes('Failed')
              ? 'Failed Contribution'
              : capitalizeFirstLetter(item.type)}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'ir',
              color: 'gray',
            }}
          >
            {item.description}
          </Text>
        </View>
        <View style={{ rowGap: 12 }}>
          <Text
            style={{
              color: item.type === 'collection' ? 'green' : 'red',
              fontSize: 16,
              fontFamily: 'ir',
            }}
          >
            {naira}
            {hideValues ? (
              <Hide color={item.type === 'collection' ? 'green' : 'red'} />
            ) : (
              item.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            )}
          </Text>
          <Text style={{ fontSize: 10, color: 'gray' }}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <PageView title={'Activities'} backIcon={false}>
      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        {userActivities.length < 1 ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text>You do not have any activity yet</Text>
          </View>
        ) : (
          <FlatList
            data={userActivities}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              backgroundColor: 'white',
              gap: 20,
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </PageView>
  );
};

export default Activities;

const styles = StyleSheet.create({});
