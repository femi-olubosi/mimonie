import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { PageView } from '@/components/Reusable';
import { Colors } from '../../constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import {
  fetchUserConnections,
  removeUserConnection,
  updateUserConnection,
} from '@/api/network.service';
import { useGlobalContext } from '../../store/StoreContext';
import { router } from 'expo-router';
import { UserConnections } from '../../src/models';
import { DataStore } from 'aws-amplify/datastore';

const connect = () => {
  const [activeTab, setActiveTab] = useState(1);
  const { userProfile, setIsLoading } = useGlobalContext();
  const [myConnections, setConnectionList] = useState([]);
  const [pendingConnections, setPendingConnectionList] = useState([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  const listConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const response = await fetchUserConnections(userProfile.userId);
      setConnectionList(
        response.filter((connection) => connection.status === 'accepted')
      );
      setPendingConnectionList(
        response.filter((connection) => connection.status === 'pending')
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  useEffect(() => {
    listConnections();
    const subscription = DataStore.observe(UserConnections).subscribe(() => {
      listConnections();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRemoveRequest = async (data) => {
    try {
      setIsLoading(true);
      await removeUserConnection(data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (data) => {
    try {
      setIsLoading(true);
      await updateUserConnection(data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConnectionItem = ({ item }) => {
    const otherUser =
      item.senderId === userProfile.userId
        ? item.receiverDetails
        : item.senderDetails;

    return (
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
          <Text style={styles.itemName}>{otherUser.name}</Text>
          <Text style={styles.itemOccupation}>{otherUser.occupation}</Text>
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
          {activeTab === 1 && (
            <Pressable
              style={{
                paddingHorizontal: 6,
                paddingVertical: 5,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: 'red',
              }}
              onPress={() => {
                handleRemoveRequest(item);
              }}
            >
              <Text
                style={{
                  color: 'red',
                  fontSize: 14,
                }}
              >
                Remove
              </Text>
            </Pressable>
          )}
          {activeTab === 2 && item?.receiverId === userProfile.userId && (
            <Pressable
              style={{
                paddingHorizontal: 6,
                paddingVertical: 5,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: Colors.pri,
              }}
              onPress={() => {
                handleAcceptRequest(item);
              }}
            >
              <Text
                style={{
                  color: Colors.pri,
                  fontSize: 14,
                }}
              >
                Accept
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <PageView title={'My Trusted Circle'}>
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ fontSize: 13, marginBottom: 12, color: 'gray' }}>
          Only people in your trusted circle can be invited to join your
          contributions.
        </Text>
        <Pressable
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-end',
            backgroundColor: Colors.pri,
            borderRadius: 4,
            marginBottom: 12,
          }}
          onPress={() => router.push('/protected/contact')}
        >
          <Text style={{ fontFamily: 'im', fontSize: 16, color: 'white' }}>
            Invite Friends
          </Text>
        </Pressable>

        {isLoadingConnections ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FontAwesome6
              name="spinner"
              size={24}
              color={Colors.pri}
              style={{ marginBottom: 10 }}
            />
            <Text style={{ fontSize: 14, color: Colors.pri }}>
              Loading connections...
            </Text>
          </View>
        ) : (
          <>
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
                  <Text
                    style={{ color: 'white', fontSize: 10, fontFamily: 'im' }}
                  >
                    {pendingConnections?.length || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {myConnections.length < 1 && activeTab === 1 && (
              <View style={styles.noConnectionsContainer}>
                <Text style={styles.noConnectionsText}>
                  You do not have any connection, please click the button below
                  to invite or connect with friends.
                </Text>
                <Text style={styles.noConnectionsText}>
                  Note, that to create a group contribution, you must have at
                  least 4 connections, as only people in your trusted circle can
                  be invited to join your contributions.
                </Text>
              </View>
            )}

            <FlatList
              data={activeTab === 1 ? myConnections : pendingConnections}
              renderItem={renderConnectionItem}
              keyExtractor={(item, idx) => idx.toString()}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </PageView>
  );
};

export default connect;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    columnGap: 10,
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
  noConnectionsContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  noConnectionsText: {
    fontSize: 14,
    color: 'grey',
    textAlign: 'center',
    marginVertical: 10,
  },
});
