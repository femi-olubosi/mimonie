import { Colors } from '@/constants/Colors';
import { ActivityIndicator, Image, Text, View } from 'react-native';

const WithdrawalLoader = ({ isLoading, text = null }) => {
  return (
    <>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              // flex: 1,
              backgroundColor: 'black',
              width: '100%',
              height: '100%',
              opacity: 0.8,
            }}
          ></View>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 40,
              borderRadius: 8,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View>
              {/* <Image
                source={require('../../assets/gif/loader.gif')}
                style={{ width: 150, height: 150 }}
              /> */}
              <ActivityIndicator color={Colors.pri} size={'large'} />
            </View>
            <Text
              style={{
                color: Colors.pri,
                marginTop: 20,
                textAlign: 'center',
                fontFamily: 'ib',
              }}
            >
              Processing Your Transfer
            </Text>
            <Text
              style={{
                color: Colors.pri,
                marginTop: 20,
                textAlign: 'center',
                fontFamily: 'ir',
              }}
            >
              Please wait
            </Text>
          </View>
        </View>
      ) : null}
    </>
  );
};

export default WithdrawalLoader;
