import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeMediaStorage } from './src/utils/storage';

const App = () => {
  useEffect(() => {
    // Initialize media storage directories when app starts
    initializeMediaStorage();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App; 