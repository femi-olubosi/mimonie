import {
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Cards from '@/components/home/Cards';
import ProfileView from '@/components/home/ProfileView';
import { ThemedView } from '@/components/ThemedView';
import { useGlobalContext } from '@/store/StoreContext';

export default function HomeScreen() {
  const { currentUser } = useGlobalContext();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ThemedView style={{ flex: 1, paddingTop: 10 }}>
        <ProfileView username={currentUser.username} />
        <Cards />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
