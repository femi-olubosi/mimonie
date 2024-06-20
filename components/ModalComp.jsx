import { View } from 'react-native';

export const ModalComp = ({ modalVisible, children }) => {
  return (
    <>
      {modalVisible ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              backgroundColor: 'black',
              opacity: 0.3,
            }}
          ></View>
          <View style={{ padding: 20, width: '100%', height: '80%' }}>
            {children}
          </View>
        </View>
      ) : null}
    </>
  );
};
