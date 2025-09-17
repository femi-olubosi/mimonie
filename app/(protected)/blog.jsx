import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const blog = () => {
  const { id } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // Find the initial index based on the id
  const initialIndex = Math.max(
    0,
    blogs.findIndex((blog) => blog.id.toString() === id)
  );

  // Scroll to the initial index after a small delay
  useEffect(() => {
    if (flatListRef.current && !initialScrollDone) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
        setCurrentIndex(initialIndex);
        setInitialScrollDone(true);
      }, 100);
    }
  }, [initialIndex, initialScrollDone]);

  // Rest of your component remains the same...
  const handleNext = () => {
    if (currentIndex < blogs.length - 1) {
      const newIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: newIndex });
      setCurrentIndex(newIndex);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: newIndex });
      setCurrentIndex(newIndex);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.page}>
      <StatusBar hidden />
      <TouchableOpacity
        style={{
          position: 'absolute',
          zIndex: 1,
          top: 50,
          left: 20,
          backgroundColor: 'black',
          padding: 5,
          borderRadius: 10,
        }}
        onPress={() => router.back()}
      >
        <AntDesign name="arrowleft" size={24} color="white" />
      </TouchableOpacity>
      <Animated.FlatList
        ref={flatListRef}
        data={blogs}
        renderItem={({ item }) => {
          return (
            <View style={styles.itemContainer}>
              <View style={styles.blogContainer}>
                {item?.banner && (
                  <Image source={item?.banner} style={styles.bannerImage} />
                )}
                <ScrollView
                  contentContainerStyle={[
                    styles.content,
                    { marginTop: item?.banner ? 0 : 90 },
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.title}>{item?.title}</Text>
                  <Text style={styles.contentText}>{item?.content}</Text>
                </ScrollView>
              </View>
            </View>
          );
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={[
            styles.navButton,
            currentIndex === 0 && styles.disabledButton,
          ]}
        >
          <AntDesign
            name="caretleft"
            size={28}
            color={currentIndex === 0 ? '#ccc' : 'black'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === blogs.length - 1}
          style={[
            styles.navButton,
            currentIndex === blogs.length - 1 && styles.disabledButton,
          ]}
        >
          <AntDesign
            name="caretright"
            size={28}
            color={currentIndex === blogs.length - 1 ? '#ccc' : 'black'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default blog;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    width: width,
    flex: 1,
  },
  blogContainer: {
    flex: 1,
    rowGap: 16,
    width: width,
  },
  bannerImage: {
    height: 250,
    width: '100%',
    resizeMode: 'cover',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  title: {
    fontSize: 20,
    fontWeight: 'im',
  },
  contentText: {
    fontSize: 15,
    fontFamily: 'ir',
    marginTop: 20,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navButton: {
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

const blogs = [
  {
    id: 1,
    title: 'Who Ate the Esusu Contribution Money?',
    content: `Every Esusu or thrift group has that one dramatic moment - when someone 'accidentally' spends the contribution money. Maybe it was for an emergency, or perhaps it was that irresistible aso-ebi for a cousin’s wedding. Whatever the excuse, the entire group suffers.

Mama Jokotola knows this pain all too well. In her thrift group, one member disappeared with the group’s money and wasn’t seen for two years. Mama Jokotola cried bitterly - she had no other means to raise money for her business. That betrayal wasn’t just about the lost money; it shattered trust and left everyone in the group devastated.

With Mimonie, stories like Mama Jokotola’s become a thing of the past. The app ensures every contribution is tracked and recorded transparently. No one can run off with the group’s money, and members can see real-time updates on their savings. Mimonie isn’t just an app; it’s your safeguard against thrift group drama.

Protect your group’s hard-earned money with Mimonie. Download the app today and save without stress!`,
    banner: require('@/assets/blog/who-ate-the-money-featured.png'),
  },
  {
    id: 2,
    title: 'The Esusu Beast and the Thrift Coordinator: A Digital Conquest',
    content: `For over seven years, I’ve been the backbone of my Esusu group. People often tell me, “You’re so organized! You make it look easy!” What they don’t see is the chaos behind the scenes. Seven years of chasing contributions, countless reminder calls, and endless negotiations over 'forgotten' bank commissions. Some members delay payments until the very last minute—leaving me scrambling to cover gaps from my pocket. Others find creative ways to cut corners, like paying a single commission for multiple arms of contributions. The stress? Overwhelming.

That’s why discovering Mimonie felt like stepping into the future. Automated reminders, transparent payment tracking, and built-in commission systems take the headache out of coordinating. No more chasing. No more anxiety. Just a seamless, efficient process that benefits everyone involved.

If I’d had Mimonie from the start, I could have saved myself years of stress and focused on what truly matters: empowering my group to achieve financial success.

Are you an Esusu (thrift) coordinator drowning in endless hustle? Let Mimonie transform your experience. Download Mimonie now and take the stress out of coordination!`,
    banner: require('@/assets/blog/taming-the-esusu-beast-featured.png'),
  },
  {
    id: 3,
    title: 'What is Esusu? A Timeless Tradition in Modern Financial Practices',
    content: `In an age of credit cards, mobile banking, and complex financial systems, a centuries-old tradition continues to thrive across African, Caribbean, and diaspora communities. Known as Esusu, this system exemplifies the power of community-driven savings and financial cooperation. 

What is Esusu?
Esusu is a traditional savings and credit system that operates through a collective effort. It is known by different names depending on the culture, such as ajo (Yoruba), adashi (Hausa), susu (Caribbean), or tontine (Francophone Africa). At its core, Esusu revolves around pooling resources among a group of people to achieve shared financial goals.
How Does Esusu Work?
Group Formation: Esusu starts with a group of individuals who trust each other, often family members, friends, or colleagues.
Regular Contributions: Members agree on a fixed amount to contribute at regular intervals, such as weekly, bi-weekly, or monthly.
Rotational Payout: The total contributions are handed over to one member of the group per cycle. The process continues until every member has received their payout.`,
    banner: require('@/assets/blog/esusu-defition.png'),
  },

  {
    id: 4,
    title:
      'What is Esusu? A Timeless Tradition in Modern Financial Practices (contd)',
    content: `Trust-based System: Esusu is inherently trust-driven, with participants relying on mutual accountability rather than formal contracts.

Why is Esusu Important?
- Savings Culture: Esusu encourages participants to save consistently, fostering financial discipline.
- Access to Lump Sums: It offers members access to substantial funds during their payout cycle, which can be used for emergencies, business investments, or significant purchases.
- Financial Inclusion: Esusu serves as an alternative for individuals without access to formal banking or credit systems, making it particularly vital in underserved communities.

Modern Innovation:
With the rise of technology, the traditional Esusu model is evolving. Apps like Mimonie have digitized the process, automating contributions, sending reminders, and tracking payments. These modern platforms reduce the burden on group coordinators and offer enhanced transparency and security for all members. Participants can now enjoy the benefits of Esusu without the stress of manual management, ensuring a seamless and efficient experience.
The Cultural and Financial Impact of Esusu
Esusu is more than a financial tool; it is a cultural legacy that celebrates trust, cooperation, and resilience. By embracing both its traditional roots and modern adaptations, Esusu continues to empower communities worldwide, proving that the strength of collective effort is timeless.

Conclusion
In a world driven by individualism, Esusu stands as a testament to the power of community. Whether in its traditional form or through modern digital platforms, Esusu provides a pathway for financial stability and growth. It’s a reminder that sometimes, the old ways hold the key to solving new challenges.
`,
    banner: '',
  },
];
