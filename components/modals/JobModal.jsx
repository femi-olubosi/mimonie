import { Colors } from '@/constants/Colors';
import { ActivityIndicator, Text, View } from 'react-native';

const JobModal = ({ isLoading, setLoading }) => {
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
            justifyContent: 'flex-end',
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
              width: '100%',
              height: '90%',
              borderRadius: 8,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View></View>
            <ActivityIndicator color={Colors.pri} size={'large'} />
            <Text
              style={{
                color: Colors.pri,
                marginTop: 20,
                textAlign: 'center',
                fontSize: 16,
                maxWidth: '90%',
                fontFamily: 'isb',
              }}
            >
              Wait while we verify your details
            </Text>
            <Text
              style={{
                color: Colors.pri,
                marginTop: 7,
                textAlign: 'center',
                maxWidth: '90%',
                fontFamily: 'im',
              }}
              //   onPress={() => setLoading(false)}
            >
              This might take a while. Try not to close the app
            </Text>
          </View>
        </View>
      ) : null}
    </>
  );
};

export default JobModal;
