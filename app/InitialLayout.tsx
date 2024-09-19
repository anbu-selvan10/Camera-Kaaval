import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const CLERK_PUBLISHABLE_KEY = 'pk_test_bW9yZS1kcmFnb24tNDMuY2xlcmsuYWNjb3VudHMuZGV2JA';

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(auth)';

    console.log('User changed: ', isSignedIn);

    if (isSignedIn && !inTabsGroup) {
      router.replace('/home');
    } else if (!isSignedIn) {
      router.replace('/login');
    }
  }, [isSignedIn]);

  return <Slot />;
};

export default InitialLayout;