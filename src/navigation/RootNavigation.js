// src/navigation/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged, signOut, reload } from '@react-native-firebase/auth';
import storage from '../services/storage';
import { AuthContext } from '../context/AuthContext';

// --- STACKS ---
import AuthStack from './AuthStack';
import AppStack from './AppStack';

// --- SCREENS (Only ones needed for root level logic) ---
import Onboarding from '../screens/auth/Onboarding';

// --- MODALS ---
import QuizModal from '../screens/learn/QuizScreen';
import ResultModal from '../screens/modals/ResultModal';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const [user, setUser] = useState(undefined);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  const authContext = useMemo(() => ({
    signIn: async () => { }, // Handled by Firebase
    signOut: async () => {
      try {
        await signOut(getAuth());
      } catch (e) {
        console.error('SignOut Error:', e);
      }
    }
  }), []);

  useEffect(() => {
    const init = async () => {
      const alreadyLaunched = await storage.load('alreadyLaunched');
      setIsFirstLaunch(alreadyLaunched === null);
    };
    init();

    const unsubscribe = onAuthStateChanged(getAuth(), async (currentUser) => {
      // If user exists, check email verification
      if (currentUser) {
        await reload(currentUser); // Refresh user data to get latest emailVerified status (modular API)
        if (currentUser.emailVerified) {
          setUser(currentUser); // Only set user if email is verified
        } else {
          setUser(null); // Treat unverified users as not logged in
        }
      } else {
        setUser(currentUser); // null or undefined
      }
    });
    return unsubscribe;
  }, []);

  if (user === undefined || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              {isFirstLaunch && (
                <Stack.Screen name="Onboarding" component={Onboarding} />
              )}
              <Stack.Screen name="Auth" component={AuthStack} />
            </>
          ) : (
            // User is logged in AND email verified -> Go to AppStack
            <Stack.Screen name="App" component={AppStack} />
          )}

          {/* Global Modals */}
          <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
            <Stack.Screen name="QuizModal" component={QuizModal} />
            <Stack.Screen name="ResultModal" component={ResultModal} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default RootNavigation;