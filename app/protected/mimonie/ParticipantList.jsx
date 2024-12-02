import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  AntDesign,
  Feather,
  Fontisto,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { capitalizeFirstLetter } from '../../../utils/capitalizeFirstLetter';
import { downloadUrl } from '../../../api/user.service';
import { Colors } from '../../../constants/Colors';

const ParticipantList = ({
  parsed,
  contribution,
  setOpenParticipantEditModal,
  imageUrls,
  setImageUrls,
  userProfile,
}) => {
  const next = parsed?.find((e) => e.status !== 'received');

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls = {};
      for (const eN of parsed) {
        if (eN.userId) {
          urls[eN.userId] = await downloadUrl(eN.userId);
        }
      }
      setImageUrls(urls);
    };
    fetchImageUrls();
  }, [parsed]);

  return (
    <>
      <View
        style={[
          {
            marginBottom: 16,
            backgroundColor: 'white',
            borderRadius: 8,
          },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.label}>Contributors</Text>
          {/* {userProfile.userId === parsed.userId && ( */}
          <Pressable onPress={() => setOpenParticipantEditModal(true)}>
            <Text style={[styles.label, { color: Colors.pri }]}>
              Rearrange Contributors
            </Text>
          </Pressable>
          {/* )} */}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            columnGap: 8,
            paddingBottom: 10,
          }}
          nestedScrollEnabled={true}
          horizontal={true}
        >
          {parsed?.map((eN, id) => {
            return (
              <View
                key={id}
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
                    {imageUrls[eN.userId] ? (
                      <Image
                        source={{ uri: imageUrls[eN.userId] }}
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
                    <Text style={{ fontFamily: 'ir' }}>{eN.name}</Text>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          columnGap: 6,
                          alignItems: 'center',
                        }}
                      >
                        <Text>{capitalizeFirstLetter(eN.status)}</Text>
                        {eN.status === 'received' ? (
                          <Fontisto
                            name="checkbox-active"
                            size={14}
                            color="green"
                          />
                        ) : eN.status === 'in progress' ? (
                          <MaterialCommunityIcons
                            name="progress-check"
                            size={14}
                            color="#ecb753"
                          />
                        ) : eN.status === 'pending' ? (
                          <AntDesign
                            name="minussquareo"
                            size={14}
                            color="gray"
                          />
                        ) : null}
                        {contribution?.type !== 'personal' &&
                        next?.userId === eN.userId ? (
                          <Text
                            style={{
                              color: 'lightgreen',
                              fontFamily: 'ir',
                            }}
                          >
                            Next
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>
                {eN?.status !== 'in progress' &&
                eN?.last_successful_round < contribution?.current_count ? (
                  <Text style={{ fontSize: 10, color: 'red' }}>
                    Attention: {'Missed last contribution'}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 10 }}>
                    Note: {'In good standing'}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

export default ParticipantList;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'ir',
  },
});
