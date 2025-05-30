import React from 'react';
import { Stack } from 'expo-router';

const ProtectedLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="personal_info" options={{ headerShown: false }} />
      <Stack.Screen name="profile_edit" options={{ headerShown: false }} />
      <Stack.Screen name="groups" options={{ headerShown: false }} />
      <Stack.Screen name="mimonie/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="help/[slug]" options={{ headerShown: false }} />
      <Stack.Screen
        name="create_contribution"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="cards" options={{ headerShown: false }} />
      <Stack.Screen name="paystack" options={{ headerShown: false }} />
      <Stack.Screen name="kyc" options={{ headerShown: false }} />
      <Stack.Screen name="transfer_screen" options={{ headerShown: false }} />
      <Stack.Screen name="complete_profile" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="bvn" options={{ headerShown: false }} />
      <Stack.Screen name="device_verify" options={{ headerShown: false }} />
      <Stack.Screen name="login_verify" options={{ headerShown: false }} />
      <Stack.Screen name="flow" options={{ headerShown: false }} />
      <Stack.Screen name="my_invites" options={{ headerShown: false }} />
      <Stack.Screen name="my_network" options={{ headerShown: false }} />
      <Stack.Screen name="faq" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="smile_id" options={{ headerShown: false }} />
      <Stack.Screen name="take_selfie" options={{ headerShown: false }} />
      <Stack.Screen name="upload_doc" options={{ headerShown: false }} />
      <Stack.Screen name="blog" options={{ headerShown: false }} />
      <Stack.Screen name="completed_screen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProtectedLayout;
