import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';

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

export const DateTimeSelector = ({ show, setShow, mode, date, setDate }) => {
  // const [date, setDate] = useState(new Date());
  //   const [mode, setMode] = useState('date');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
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
        borderRadius: 14,
        borderWidth: drop ? 2 : 1,
        borderColor: 'gray',
      }}
    >
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
          }}
        >
          {options?.map((e, idx) => (
            <Pressable
              key={idx}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderBottomWidth: idx === options.length - 1 ? 0 : 1,
                borderColor: 'gray',
              }}
              onPress={() => {
                setSelectedValue(e.value);
                setDrop(false);
              }}
            >
              <Text style={{ color: 'gray' }}>{e.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};
