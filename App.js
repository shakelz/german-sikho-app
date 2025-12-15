import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation/RootNavigation';
import { ProgressProvider } from './src/context/ProgressContext';
import AssetService from './src/services/AssetService';

const App = () => {
  // Initialize AssetService on app startup
  useEffect(() => {
    AssetService.init();
  }, []);

  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <RootNavigation />
      </ProgressProvider>
    </SafeAreaProvider>
  );
};

export default App;