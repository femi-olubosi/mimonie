import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const Blog = () => {
  return (
    <View style={{ paddingVertical: 20 }}>
      <Text
        style={{
          marginBottom: 12,
          marginStart: 20,
          fontSize: 15,
          fontFamily: 'im',
        }}
      >
        Thrifter's Blog
      </Text>
      <FlatList
        data={blogs}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              key={item?.id}
              style={{ rowGap: 16, width: 293, marginStart: 20 }}
              onPress={() =>
                router.push({
                  pathname: '/protected/blog',
                  params: { id: item.id },
                })
              }
            >
              <Image
                source={item?.banner}
                style={{
                  height: 173,
                  width: '100%',
                  resizeMode: 'cover',
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 16, fontFamily: 'ir' }}>
                {item?.title}
              </Text>
            </TouchableOpacity>
          );
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Blog;

const styles = StyleSheet.create({});

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
    content: `For over seven years, I’ve been the backbone of my Esusu group. People often tell me, “You’re so organized! You make it look easy!” What they don’t see is the chaos behind the scenes. Seven years of chasing contributions, countless reminder calls, and endless negotiations over 'forgotten' bank commissions. Some members delay payments until the very last minute—leaving me scrambling to cover gaps from my pocket. Others find creative ways to cut corners, like paying a single commission for multiple arms of contributions. The stress? Overwhelming.

That’s why discovering Mimonie felt like stepping into the future. Automated reminders, transparent payment tracking, and built-in commission systems take the headache out of coordinating. No more chasing. No more anxiety. Just a seamless, efficient process that benefits everyone involved.

If I’d had Mimonie from the start, I could have saved myself years of stress and focused on what truly matters: empowering my group to achieve financial success.

Are you an Esusu (thrift) coordinator drowning in endless hustle? Let Mimonie transform your experience. Download Mimonie now and take the stress out of coordination!`,

    banner: require('@/assets/blog/esusu-defition.png'),
  },
];
