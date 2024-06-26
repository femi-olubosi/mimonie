import {
  ActivityIndicator,
  Button,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { PageView } from '../../components/Reusable';
import { useGlobalContext } from '../../store/StoreContext';
import { Colors } from '../../constants/Colors';
import { notificationIcon } from '../../utils/notificationsIcon';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { updateNotification } from '../../api/notifications.service';

const notifications = () => {
  const { notifications, setNotifications } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allFetched, setAllFetched] = useState(false);

  const fetchMoreNotifications = () => {};

  const handleNotificationPress = async (notification) => {
    try {
      setSelectedNotification(notification);
      setModalVisible(true);
      await updateNotification(notification.id, { read: true });
      const updatedNotifications = notifications.map((e) => {
        if (e.id === notification.id) {
          return { ...e, read: true };
        } else {
          return e;
        }
      });
      setNotifications(updatedNotifications);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PageView title={'Notifications'}>
      <View style={{ padding: 20 }}>
        <ScrollView
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              fetchMoreNotifications();
            }
          }}
          scrollEventThrottle={400}
          showsVerticalScrollIndicator={false}
        >
          {notifications?.map((notification) => (
            <Pressable
              key={notification.id}
              style={[
                styles.notificationItem,
                notification?.read ? styles.read : styles.unread,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationContent}>
                {notificationIcon(notification.type)}
                <View style={styles.notificationTextContainer}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.notificationBody}>
                    {notification.content}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  rowGap: 5,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}
              >
                <Text style={styles.notificationDate}>
                  {formatTimestamp(notification.createdAt).split(',')[0]}
                </Text>
                <Text style={styles.notificationDate}>
                  {formatTimestamp(notification.createdAt).split(',')[1]}
                </Text>
              </View>
            </Pressable>
          ))}
          {loading && <ActivityIndicator size="large" color={'black'} />}
        </ScrollView>

        {selectedNotification && (
          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {selectedNotification.title}
                </Text>
                <Text style={styles.modalBody}>
                  {selectedNotification.content}
                </Text>
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.modalDate}>
                    {formatTimestamp(selectedNotification.createdAt)}
                  </Text>
                  <View style={{ rowGap: 10 }}>
                    {Platform.OS === 'ios' ? (
                      <Button
                        title="Close"
                        onPress={() => setModalVisible(false)}
                      />
                    ) : (
                      <Pressable
                        style={{
                          alignSelf: 'center',
                          fontFamily: 'im',
                          marginTop: 10,
                        }}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text>Close</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </PageView>
  );
};

export default notifications;

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  read: {
    borderColor: '',
    borderWidth: 0,
  },
  unread: {
    borderColor: Colors.pri,
    borderWidth: 3,
  },
  notificationTextContainer: {
    marginLeft: 6,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'im',
  },
  notificationBody: {
    color: 'gray',
    fontFamily: 'ir',
  },
  notificationDate: {
    fontSize: 10,
    fontFamily: 'ir',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'im',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 16,
    fontFamily: 'ir',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 14,
    fontFamily: 'ir',
    marginVertical: 20,
  },
});
