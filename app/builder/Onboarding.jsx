import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const Onboarding = ({ setOnboard }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;

  const onboardingScreens = [
    {
      id: '1',
      title: 'Join a Community of Contributors',
      description:
        "Welcome to Mimonie, where your financial growth is powered by collaboration. Whether it's for savings, a business venture, or a special project, join like-minded individuals to contribute and build wealth together.",
      image: require('../../assets/onboard/coin.jpg'),
    },
    {
      id: '2',
      title: 'Simplify Your Contributions',
      description:
        'Manage your group or personal contributions with ease. Schedule contributions, track progress, and invite others to join. Mimonie makes it seamless for you to achieve your financial goals.',
      image: require('../../assets/onboard/onboard-1.webp'),
    },
    {
      id: '3',
      title: 'Stay in Control, Anytime, Anywhere',
      description:
        'Keep track of your contributions and payouts in real-time, with transparent fees and timely notifications. With Mimonie, you’re always in control of your financial journey.',
      image: require('../../assets/onboard/coin-1.jpg'),
    },
  ];

  const handleNext = () => {
    if (currentIndex < onboardingScreens.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSignIn = () => {
    setOnboard(false);
  };

  const renderOnboardingScreen = ({ item }) => (
    <View style={{ width: screenWidth }}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {currentIndex === onboardingScreens.length - 1 ? (
        <View style={styles.authOptions}>
          <TouchableOpacity style={styles.authButton} onPress={handleSignIn}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <AntDesign name="rightcircleo" size={44} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleScroll = (event) => {
    const index = Math.ceil(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingScreens}
        renderItem={renderOnboardingScreen}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.indicatorContainer}>
        {onboardingScreens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pri,
  },
  imageContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  textContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'ir',
    color: 'white',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: 'ir',
    color: 'white',
    textAlign: 'left',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  indicator: {
    width: 80,
    height: 7,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: 'black',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  nextButton: {
    height: 70,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: Colors.pri,
    fontSize: 18,
    fontWeight: 'bold',
  },
  authOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    height: 70,
    justifyContent: 'center',
  },
  authButton: {},
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Onboarding;
