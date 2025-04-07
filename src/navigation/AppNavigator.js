import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import App from '../App';
import DroneMediaScreen from '../screens/DroneMediaScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
       {/* <NavigationContainer> wraps the entire app */}
        <NavigationContainer>
           {/* Stack.Navigator (created by createNativeStackNavigator) manages screens */}
          <Stack.Navigator
            initialRouteName="Main" //initialRouteName="Main" which is the first screen to load
            screenOptions={{
              headerShown: false, //headerShown: false, hides the header on all screens
            }}
          >
            {/* <Stack.Screen name="Main" component={App} /> */}
            <Stack.Screen 
              name="Main" 
              component={App}
            />
            <Stack.Screen 
              name="DroneMedia" 
              component={DroneMediaScreen}
              options={{
                headerShown: true,
                title: 'Drone Media',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default AppNavigator; 