import { fetchProfile, fetchUserProfile } from '@/api/user.service';
import { modalSteps } from '@/components/modals/UserVerificationModal';
import { useEffect } from 'react';

const useUserVerificationSteps = ({
  currentUser,
  hasShownModal,
  setCompletedSteps,
  setShowUserVerificationModal,
  setHasShownModal,
}) => {
  useEffect(() => {
    if (hasShownModal) return;

    const checkSteps = async () => {
      try {
        const profile = await fetchProfile(currentUser);

        if (profile?.name && profile?.phone_verified) {
          const steps = [
            profile?.is_bvn_verified && 'bvn',
            profile?.is_nin_verified && 'kyc',
            profile?.auth_url && 'card',
          ].filter(Boolean);

          setCompletedSteps(steps);
          setShowUserVerificationModal(steps?.length < modalSteps.length);
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
