import { Colors } from '@/constants/Colors';
import { ActivityIndicator, Text, View } from 'react-native';

const Loader = ({ isLoading, text = null }) => {
  // const { isLoading } = useGlobalContext();
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
              width: text ? 120 : 70,
              height: text ? 120 : 70,
              borderRadius: 8,
              backgroundColor: Colors.pri,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View>
              {/* <Image source={require('../../assets/general/back-ill.png')} /> */}
            </View>
            <ActivityIndicator color={'white'} size={'large'} />
            {text && (
              <Text style={{ color: 'white', marginTop: 20 }}>
                Please wait. This might take a while
              </Text>
            )}
          </View>
        </View>
      ) : null}
    </>
  );
};

export default Loader;
