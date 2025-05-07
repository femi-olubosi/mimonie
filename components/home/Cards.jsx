import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import ContributionCard from './components/ContributionCard';
import { CardOne } from './components/IntroCard';
import { CardTwo } from './components/IntroCard';

const Cards = ({ contributions }) => {
  const contributionWithIntro =
    contributions?.length < 200 ? [1, 2, ...contributions] : contributions;
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={contributionWithIntro}
        renderItem={({ item }) => {
          if (item === 1) {
            return <CardOne />;
          } else if (item === 2) {
            return <CardTwo />;
          } else {
            return <ContributionCard item={item} />;
          }
        }}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default Cards;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  noContributionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: 200,
  },
  noContributionsText: {
    fontSize: 16,
    color: 'gray',
    fontFamily: 'ir',
  },
  card: {
    backgroundColor: Colors.pri,
    borderRadius: 10,
    marginStart: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    paddingRight: 95,
    minWidth: 300,
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
});
