import { Feather } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, {
  OpacityDecorator,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Button from '../../../components/Button';
import { editContributionParticipant } from '../../../api/contributions.service';
import { Colors } from '../../../constants/Colors';

const Drag = ({ parsed, setParsed, imageUrls, contribution, onFinished }) => {
  const [updatedParticipants, setUpdatedParticipants] = useState(parsed);
  const [isLoading, setIsLoading] = useState(false);

  const renderItem = useCallback(
    ({ item, drag }) => (
      <OpacityDecorator>
        <TouchableOpacity
          onLongPress={drag}
          key={item.userId}
          style={{
            justifyContent: 'center',
            height: 100,
            minWidth: 200,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            backgroundColor: 'white',
            paddingHorizontal: 8,
            rowGap: 10,
            shadowColor: 'gray',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              columnGap: 10,
              alignItems: 'center',
            }}
          >
            <View>
              {imageUrls[item.userId] ? (
                <Image
                  source={{ uri: imageUrls[item.userId] }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    backgroundColor: '#E5E7EB',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Feather
                  name="image"
                  color={'gray'}
                  size={40}
                  style={{
                    padding: 0,
                    margin: 0,
                  }}
                />
              )}
            </View>
            <View style={{ rowGap: 4 }}>
              <Text style={{ fontFamily: 'ir' }}>{item.name}</Text>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    columnGap: 6,
                    alignItems: 'center',
                  }}
                >
                  <Text>{item.index}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </OpacityDecorator>
    ),
    []
  );

  const handleDragEnd = ({ data }) => {
    setUpdatedParticipants(
      data.map((item, idx) => ({ ...item, index: idx + 1 }))
    );
  };

  const handleFinishedEditing = async () => {
    setIsLoading(true);
    try {
      await editContributionParticipant(contribution.id, updatedParticipants);
      setParsed(updatedParticipants);
      onFinished();
    } catch (err) {
      console.error('Error editing participants:', err);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size={'large'} color={Colors.pri} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={{ marginBottom: 10, fontFamily: 'ir' }}>
        Press and hold down to drag item
      </Text>
      <DraggableFlatList
        data={updatedParticipants}
        renderItem={renderItem}
        keyExtractor={(item) => item.userId.toString()}
        onDragEnd={handleDragEnd}
        showsVerticalScrollIndicator={false}
        style={{}}
      />

      <Button
        title={'Finished'}
        color={Colors.pri}
        onPress={handleFinishedEditing}
      />
    </GestureHandlerRootView>
  );
};

export default Drag;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
});
