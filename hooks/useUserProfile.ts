import { fetchProfile, fetchUserProfile } from '@/api/user.service';
import { useEffect } from 'react';

interface UseUserProfileParams {
  userProfile?: { name: string };
  currentUser?: { userId: string };
  setUserProfile: (profile: any) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUserProfile = ({
  currentUser,
  setUserProfile,
  setIsLoading,
  userProfile,
}: UseUserProfileParams) => {
  useEffect(() => {
    const loadUserProfile = async () => {
      if (userProfile?.name) return;
      setIsLoading(true);

      try {
        const profile = await fetchProfile(currentUser);
        console.log('reached', profile?.name);
        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    loadUserProfile();
  }, [currentUser]);
};
