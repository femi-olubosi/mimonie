import { fetchUserProfile } from '@/api/user.service';
import { useEffect } from 'react';

const useUserVerificationSteps = ({
  currentUser,
  hasShownModal,
  setUserProfile,
  setCompletedSteps,
  setShowUserVerificationModal,
  setHasShownModal,
}) => {
  useEffect(() => {
    if (hasShownModal) return;

    const checkSteps = async () => {
      try {
        const profile = await fetchUserProfile(setUserProfile, currentUser);

        if (profile?.name && profile?.phone_verified) {
          const steps = [
            profile?.is_bvn_verified && 'bvn',
            profile?.is_nin_verified && 'kyc',
            profile?.auth_url && 'card',
          ].filter(Boolean);

          setCompletedSteps(steps);
          setShowUserVerificationModal(steps.length < 3);
          setHasShownModal(true);
        }
      } catch (err) {
        console.error('Error checking verification steps:', err);
      }
    };

    checkSteps();
  }, [currentUser, hasShownModal]);
};

export default useUserVerificationSteps;
