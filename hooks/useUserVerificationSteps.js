import { fetchProfile } from '@/api/user.service';
import { modalSteps } from '@/components/modals/UserVerificationModal';
import { useEffect, useState } from 'react';

const useUserVerificationSteps = ({
  currentUser,
  hasShownModal,
  setCompletedSteps,
  setShowUserVerificationModal,
  setHasShownModal,
}) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (hasShownModal) return;

    const checkSteps = async () => {
      try {
        const fetchedProfile = await fetchProfile(currentUser);
        setProfile(fetchedProfile);

        if (fetchedProfile?.name && fetchedProfile?.phone_verified) {
          const steps = [
            fetchedProfile?.is_bvn_verified && 'bvn',
            fetchedProfile?.is_nin_verified && 'kyc',
            fetchedProfile?.auth_url && 'card',
          ].filter(Boolean);

          setCompletedSteps(steps);
          setShowUserVerificationModal(steps.length < modalSteps.length);
          setHasShownModal(true);
        }
      } catch (err) {
        console.error('Error checking verification steps:', err);
      }
    };

    checkSteps();
  }, [currentUser, hasShownModal]);

  return profile;
};

export default useUserVerificationSteps;
