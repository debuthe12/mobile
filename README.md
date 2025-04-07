# React Native Navigation Modules

## Core Navigation Components

### NavigationContainer
The root component that manages the navigation state and links your top-level navigator to the app environment.

**Key Features:**
- Acts as a context provider for navigation
- Manages navigation state
- Handles deep linking integration
- Manages system back button on Android
- Provides screen tracking capabilities

### createNativeStackNavigator
Creates a native stack navigator that provides screen transitions using native platform APIs.

**Key Features:**
- Uses native navigation APIs (UINavigationController on iOS, Fragment on Android)
- Manages screen transitions with platform-specific animations
- Provides stack-based navigation (push/pop screens)
- Handles screen configuration and options

## How They Work Together

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>      {/* Root container */}
      <Stack.Navigator>        {/* Stack navigator */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Why Two Different Modules?

1. **NavigationContainer**
   - Single instance per app
   - Manages global navigation state
   - Required as the root wrapper
   - Handles app-level navigation features

2. **createNativeStackNavigator**
   - Can have multiple instances
   - Handles specific navigation patterns
   - Manages screen transitions
   - Configures individual screen options

Think of NavigationContainer as the "navigation manager" and createNativeStackNavigator as the "navigation implementation" - you need both for a complete navigation system.

## Best Practices

1. Always wrap your app's navigation with NavigationContainer
2. Use createNativeStackNavigator for screen-to-screen navigation
3. Configure screen options at the Stack.Screen level
4. Handle navigation logic using the navigation prop provided to screens

## Additional Navigation Types

React Navigation also supports other navigation patterns:
- Tab Navigation
- Drawer Navigation
- Bottom Sheet Navigation
- Modal Navigation

Choose the appropriate navigator based on your app's navigation requirements.

## React Native Gesture Handler

### Overview
React Native Gesture Handler provides native-driven gesture management APIs for handling touch and gesture interactions in React Native applications. It replaces React Native's built-in touch system with more performant native implementations.

### Key Features
- Native performance through direct gesture handling on native threads
- Support for complex gestures (pan, pinch, rotation, etc.)
- Integration with native animation libraries
- Cross-platform consistency (iOS & Android)
- Support for multiple simultaneous gestures
- 120 FPS animations capability

### Basic Setup
```javascript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app content */}
    </GestureHandlerRootView>
  );
}
```
### Available Gesture Handlers
- Pan Gesture
- Tap Gesture
- Long Press Gesture
- Rotation Gesture
- Pinch Gesture
- Fling Gesture
- Native Button Components
- Swipeable Components
- Drawer Layouts

### Best Practices
1. Always wrap your app with GestureHandlerRootView
2. Use appropriate gesture handlers based on interaction needs
3. Combine with React Native Reanimated for smooth animations
4. Consider gesture handler interactions when nesting touchable components
5. Implement proper gesture feedback for better UX

### Integration Benefits
- Improved touch response time
- More reliable gesture recognition
- Better performance for gesture-based animations
- Native feedback and behavior
- Support for complex gesture combinations


    1. handlePhotoCapture() in DroneControl.jsx is called
     2. Checks if drone is connected and streaming
     3. Calls onCapturePhoto() (handleCapturePhoto in App.jsx)
     4. handleCapturePhoto calls droneConnection.capturePhoto()
     5. If successful, saves the photo using savePhoto()

   Recording Start:
   1. User presses "Record" button
   2. handleRecordingToggle(true) is called
   3. droneConnection.startRecording() is invoked
   4. Creates a UDP socket for video data
   5. Starts accumulating video data in a buffer
   6. Updates Redux state (isRecording = true)

   Recording Stop:
   1. User presses "Stop" button
   2. handleRecordingToggle(false) is called
   3. droneConnection.stopRecording() is invoked
   4. Converts accumulated buffer to base64
   5. Cleans up resources
   6. Updates Redux state (isRecording = false)
   7. Returns video data for saving

For more detailed information, visit the [official documentation](https://docs.swmansion.com/react-native-gesture-handler/docs/).

## JavaScript (.js) vs JSX (.jsx) Files

### Overview
In this project, we use `.js` extension for our React Native files. While both `.js` and `.jsx` extensions work for files containing JSX syntax, here's why we chose `.js`:

1. **React Native Convention**: React Native projects traditionally use `.js` extensions, making it a common community practice.

2. **Build System Compatibility**: Our build system (Metro bundler) treats `.js` and `.jsx` files identically, transpiling JSX syntax regardless of the extension.

3. **Simplicity**: Using `.js` maintains consistency with other JavaScript files in the project that might not contain JSX.

4. **IDE Support**: Modern IDEs and editors provide full JSX support for `.js` files in React Native projects.

### Key Points
- Both `.js` and `.jsx` extensions support JSX syntax
- The functionality remains identical regardless of the extension
- Babel configuration handles JSX transformation for both extensions
- File extension choice is primarily a matter of team convention

For more information about React Native development practices, visit the [official React Native documentation](https://reactnative.dev/docs).

