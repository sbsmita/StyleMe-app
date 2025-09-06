import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator'; // Corrected path
import SubscriptionService from './src/services/subscriptionService';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => {
  useEffect(() => {
    // Initialize RevenueCat when app starts
    SubscriptionService.initializePurchases();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;
