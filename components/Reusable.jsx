import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
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
    if (setDatePick) {
      setDatePick(currentDate);
    }
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View
      style={{
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'gray',
        minHeight: 53,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pressable style={styles.pressable} onPress={() => setDrop(!drop)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedValueText}>
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
      {drop && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((e, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.option,
                    idx === filteredOptions.length - 1 ? styles.lastOption : {},
                  ]}
                  onPress={() => {
                    setSelectedValue(e);
                    setDrop(false);
                    setSearchQuery(''); // Reset search query after selection
                  }}
                >
                  <Text style={styles.optionText}>{e.label}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noOptionsText}>No options found</Text>
            )}
          </ScrollView>
        </View>
      )}
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

export const SkeletonLoader = ({ width, height, borderRadius = 4 }) => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
      ]}
    />
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
  pressable: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  selectedValueText: {
    fontSize: 14,
    color: 'gray',
  },
  dropdown: {
    width: '100%',
    paddingVertical: 6,
    maxHeight: 250,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  searchInput: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  option: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    color: 'gray',
  },
  noOptionsText: {
    padding: 10,
    color: 'gray',
    textAlign: 'center',
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
});
