// useFirebaseLogin.js
import { Auth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useRef } from 'react';
import FirebaseRecaptchaBanner from './firebase-recaptcha/banner';
import FirebaseRecaptchaVerifierModal from './firebase-recaptcha/modal';

export const useFirebaseLogin = ({
  auth,
  firebaseConfig,
  modalOption,
  bannerOption,
}) => {
  const recaptchaVerifier = useRef(null);

  const sendOtp = async (phoneNumber) => {
    if (!phoneNumber || !recaptchaVerifier.current) return;
    const phoneProvider = new PhoneAuthProvider(auth);
    return phoneProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier.current
    );
  };

  const verifyOtp = async (verificationId, otp) => {
    if (!verificationId || !otp) return;
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    return signInWithCredential(auth, credential);
  };

  return {
    recaptcha: (
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        {...modalOption}
      />
    ),
    recaptchaBanner: <FirebaseRecaptchaBanner {...bannerOption} />,
    sendOtp,
    verifyOtp,
  };
};
