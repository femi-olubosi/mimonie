import { useGlobalContext } from '@/store/StoreContext';
import { fetchInviteContributions } from '@/api/invite.service';
import { fetchUserProfile } from '@/api/user.service';

const render = async (userProfile) => {
  const { setInviteArray, setUserProfile } = useGlobalContext();

  if (userProfile?.invites) {
    try {
      const fetchedContributions = await fetchInviteContributions(
        userProfile.invites
      );
      setInviteArray(fetchedContributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  }
};

export default render;
