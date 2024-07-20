import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SelectInput } from '../Reusable';
import { fetchCountries } from '../../api/payment.service';
import Button from '../Button';
import { Colors } from '../../constants/Colors';

const Setup = ({ setStep }) => {
  const [countries, setCountries] = useState([]);
  const [countryValue, setCountryValue] = useState({});
  const [idValue, setIDValue] = useState({});

  useEffect(() => {
    const fetchCountry = async () => {
      const res = await fetchCountries();
      setCountries(res);
    };
    fetchCountry();
  }, []);

  return (
    <View style={{ width: '100%' }}>
      <Text
        style={{
          fontSize: 26,
          textAlign: 'center',
          marginBottom: 70,
          fontFamily: 'eb',
        }}
      >
        Select ID Type
      </Text>
      <View style={{ width: '100%', rowGap: 10 }}>
        <Text style={{ fontFamily: 'im' }}>Select Country</Text>
        <SelectInput
          options={countries}
          selectedValue={countryValue}
          setSelectedValue={setCountryValue}
          defaultValue={countryValue?.label}
        />
      </View>
      <View style={{ width: '100%', rowGap: 10, marginTop: 40 }}>
        <Text style={{ fontFamily: 'im' }}>Select ID Type</Text>
        <SelectInput
          options={idOption}
          selectedValue={idValue}
          setSelectedValue={setIDValue}
          defaultValue={idValue?.label}
        />
      </View>
      <View style={{ alignItems: 'center', rowGap: 10 }}>
        <Button
          title={'I am ready'}
          color={Colors.pri}
          onPress={() => setStep(2)}
        />
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: 'red', fontSize: 16, fontFamily: 'ir' }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Setup;

const styles = StyleSheet.create({});

const idOption = [
  {
    label: 'Drivers License',
    value: 'DRIVERS_LICENSE',
  },
  {
    label: 'Passport',
    value: 'PASSPORT',
  },
  {
    label: 'Voters Card',
    value: 'VOTERS_CARD',
  },
  {
    label: 'National ID',
    value: 'NATIONAL_ID',
  },
];
