import { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { topBar } from '../cStyle';
import { router } from 'expo-router';

export const Text14 = ({ text }) => (
  <Text style={{ color: '#424856', fontFamily: 'er', fontSize: 14 }}>
    {text}
  </Text>
);
export const Text16 = ({ text }) => (
  <Text style={{ color: '#424856', fontFamily: 'er', fontSize: 16 }}>
    {text}
  </Text>
);
export const Text18 = ({ text }) => (
  <Text style={{ color: '#424856', fontFamily: 'er', fontSize: 18 }}>
    {text}
  </Text>
);

export const DateTimeSelector = ({
  show,
  setShow,
  mode,
  date,
  setDate,
  setDatePick,
}) => {
  // const [date, setDate] = useState(new Date());
  //   const [mode, setMode] = useState('date');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    setDatePick(currentDate);
  };

  //   const showMode = (currentMode) => {
  //     setShow(true);
  //     setMode(currentMode);
  //   };

  //   const showDatepicker = () => {
  //     showMode('date');
  //   };

  //   const showTimepicker = () => {
  //     showMode('time');
  //   };

  return (
    show && (
      <DateTimePicker
        testID="dateTimePicker"
        value={date}
        mode={mode}
        is24Hour={true}
        onChange={onChange}
      />
    )
  );
};

export const SelectInput = ({
  options,
  selectedValue,
  setSelectedValue,
  defaultValue,
}) => {
  const [drop, setDrop] = useState(false);

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: drop ? 2 : 1,
        borderColor: 'gray',
        minheight: 53,
        maxHeight: 200,
      }}
    >
      <ScrollView>
        <Pressable
          style={{
            width: '100%',
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}
          onPress={() => setDrop(!drop)}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: 'gray' }}>
              {selectedValue.label ?? defaultValue}
            </Text>
          </View>
          <View>
            <FontAwesome
              name={drop ? 'angle-up' : 'angle-down'}
              size={24}
              color="black"
            />
          </View>
        </Pressable>
        {drop ? (
          <View
            style={{
              width: '100%',
              paddingVertical: 6,
              backgroundColor: 'white',
            }}
          >
            {options?.map((e, idx) => (
              <Pressable
                key={idx}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderBottomWidth: idx === options.length - 1 ? 0 : 1,
                  borderColor: 'gray',
                }}
                onPress={() => {
                  setSelectedValue(e);
                  setDrop(false);
                }}
              >
                <Text style={{ color: 'gray' }}>{e.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export const PageView = ({
  title,
  right,
  children,
  backIcon = true,
  route = null,
}) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F9FF' }}>
      <View
        style={[
          styles.header,
          { justifyContent: backIcon ? 'space-between' : 'center' },
        ]}
      >
        <View
          style={{ flexDirection: 'row', columnGap: 10, alignItems: 'center' }}
        >
          {backIcon && (
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              onPress={() => (route ? router.push(route) : router.back())}
            />
          )}
          <View>
            <Text style={[styles.headerTitle, { marginBottom: 5 }]}>
              {title}
            </Text>
          </View>
        </View>
        {right && (
          <TouchableOpacity
            onPress={() => router.push('/protected/profile_edit')}
          >
            <AntDesign name="edit" size={20} color={'black'} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flex: 1, backgroundColor: 'white' }}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    padding: 16,
    height: Platform.OS === 'android' ? 128 : 80,
    paddingTop: topBar,
    backgroundColor: '#F0F9FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
