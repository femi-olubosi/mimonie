import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React, { useEffect } from 'react';
import { PageView } from '../../components/Reusable';
import { useGlobalContext } from '../../store/StoreContext';
import { getContributionGroups } from '../../api/groups.service';
import { Colors } from '../../constants/Colors';
import Button from '../../components/Button';
import { router } from 'expo-router';

const groups = () => {
  const {
    contributionGroups,
    setContributionGroups,
    currentUser,
    userProfile,
  } = useGlobalContext();

  useEffect(() => {
    getContributionGroups(setContributionGroups);
  }, []);

  const handleGoToCreate = (item) => {
    if (!userProfile.income_from || userProfile.income_from < item.amount) {
      alert('Your income cannot create this contribution');
      return;
    }
    router.push('/protected/create_contribution');
  };
  return (
    <PageView title={'Groups'}>
      <ScrollView contentContainerStyle={styles.container}>
        {contributionGroups.map((item) => (
          <View
            key={item.id}
            style={[
              styles.groupContainer,
              { backgroundColor: item.body_color, zIndex: 1 },
            ]}
          >
            <View style={styles.groupContent}>
              <Text style={styles.groupTitle}>{item.title}</Text>
              <Text style={styles.groupSubtitle}>
                N{item.amount}/month x {item.num_of_month}
              </Text>
              <Text style={styles.groupTarget}>Target: N{item.target}</Text>
              <Button
                title={'Create Contribution'}
                onPress={() => handleGoToCreate(item)}
                color={'black'}
              />
            </View>
            <View
              style={[styles.sideColor, { backgroundColor: item.side_color }]}
            />
            <Image
              source={require('../../assets/logo/platte.png')}
              style={{
                position: 'absolute',
                right: 0,
                objectFit: 'center',
                marginTop: 20,
              }}
            />
          </View>
        ))}
      </ScrollView>
    </PageView>
  );
};

export default groups;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  groupContainer: {
    height: 266,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginBottom: 20,
    // alignItems: 'center',
  },
  groupContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    rowGap: 10,
  },
  groupTitle: {
    fontSize: 32,
    fontFamily: 'esb',
    color: 'white',
  },
  groupSubtitle: {
    fontSize: 20,
    fontFamily: 'ir',
    color: 'white',
  },
  groupTarget: {
    fontSize: 16,
    fontFamily: 'im',
    color: 'white',
  },
  sideColor: {
    width: 73,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
});
