import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import { PageView } from '@/components/Reusable';
import { Colors } from '../../constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';

const dummyConnections = [
  { id: '1', name: 'John Doe', occupation: 'Software Developer' },
  { id: '2', name: 'Jane Smith', occupation: 'Graphic Designer' },
  { id: '3', name: 'Emily Johnson', occupation: 'Project Manager' },
];

const dummyPendingRequests = [
  { id: '4', name: 'Michael Brown', occupation: 'Data Scientist' },
  { id: '5', name: 'Sarah Wilson', occupation: 'Product Manager' },
];

const connect = () => {
  const [activeTab, setActiveTab] = useState(1);

  const handleRemoveRequest = (item) => {};

  const handleConnectRequest = (data) => {};

  const renderConnectionItem = ({ item }) => (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        styles.itemContainer,
      ]}
    >
      <View style={{ rowGap: 5 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOccupation}>{item.occupation}</Text>
      </View>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}
      >
        {activeTab === 2 && (
          <Pressable
            style={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: 'red',
            }}
            onPress={() => handleRemoveRequest(item)}
          >
            <FontAwesome6 name="times-circle" size={16} color={'red'} />
          </Pressable>
        )}
        <Pressable
          style={{
            paddingHorizontal: 6,
            paddingVertical: 5,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: activeTab === 1 ? 'red' : Colors.pri,
          }}
          onPress={() => handleConnectRequest(item)}
        >
          <Text
            style={{
              color: activeTab === 1 ? 'red' : Colors.pri,
              fontSize: 14,
            }}
          >
            {activeTab === 1 ? 'Remove' : 'Accept'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <PageView title={'My Network'}>
      <View style={{ padding: 20 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab(1)}
            style={{
              borderRadius: 4,

              paddingVertical: 4,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: activeTab === 1 ? 1 : 0,
              borderBottomColor: activeTab === 1 ? Colors.pri : 'gray',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: activeTab === 1 ? Colors.pri : 'gray',
                paddingRight: 10,
                fontFamily: activeTab === 1 ? 'ib' : 'ir',
              }}
            >
              Connections
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab(2)}
            style={{
              borderRadius: 4,

              paddingVertical: 4,
              justifyContent: 'center',
              alignItems: 'center',
              borderBottomWidth: activeTab === 2 ? 1 : 0,
              borderBottomColor: activeTab === 2 ? Colors.pri : 'gray',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: activeTab === 2 ? Colors.pri : 'gray',
                paddingRight: 10,
                fontFamily: activeTab === 2 ? 'ib' : 'ir',
              }}
            >
              Pending Requests
            </Text>
            <View
              style={{
                borderRadius: 100,
                width: 15,
                height: 15,
                backgroundColor: 'red',
                position: 'absolute',
                top: -5,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 10, fontFamily: 'im' }}>
                {dummyPendingRequests.length || 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 1 ? dummyConnections : dummyPendingRequests}
          renderItem={renderConnectionItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </PageView>
  );
};

export default connect;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    columnGap: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabText: {
    fontSize: 18,
    color: 'grey',
    position: 'relative',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: 'black',
  },
  badgeContainer: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 5,
    position: 'absolute',
    top: -10,
    right: -10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  itemContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemOccupation: {
    fontSize: 14,
    color: 'grey',
  },
});
