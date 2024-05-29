import { ActivityIndicator, Text, View } from 'react-native';

const Loader = ({ isLoading }) => {
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
          <View style={{}}>
            <View>
              {/* <Image source={require('../../assets/general/back-ill.png')} /> */}
            </View>
            <ActivityIndicator color={'white'} size={'large'} />
            <Text style={{ color: 'white', marginTop: 20 }}>
              Please wait...
            </Text>
          </View>
        </View>
      ) : null}
    </>
  );
};

export default Loader;
