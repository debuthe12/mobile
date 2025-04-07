import React, { useEffect } from 'react';
import { StatusBar, View, StyleSheet, Alert } from 'react-native';
import VideoFeed from '@components/VideoFeed';
import DroneControl from '@components/DroneControl';
import DroneStateDisplay from '@components/DroneStateDisplay';
import VirtualJoystick from '@components/VirtualJoystick';
import { initializeMediaStorage } from '@utils/storage';
import droneConnection from '@services/droneConnection';
import { useDispatch } from 'react-redux';
import { setRecording } from '@store/slices/droneSlice';

const App = () => {
  const dispatch = useDispatch();

  const handleJoystickControl = (data) => {
    // Handle joystick input here
    console.log('Joystick control:', data);
  };

  useEffect(() => {
    const setupStorage = async () => {
      await initializeMediaStorage();
    };
    
    setupStorage();
  }, []);

  const handleCapturePhoto = async () => {
    try {
      const photoData = await droneConnection.capturePhoto();
      return photoData;
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      return null;
    }
  };

  const handleToggleRecording = async (isStarting) => {
    try {
      if (isStarting) {
        await droneConnection.startRecording();
        dispatch(setRecording(true));
        return true;
      } else {
        const videoData = await droneConnection.stopRecording();
        dispatch(setRecording(false));
        return videoData;
      }
    } catch (error) {
      console.error('Error handling recording:', error);
      Alert.alert('Error', `Failed to ${isStarting ? 'start' : 'stop'} recording. Please try again.`);
      dispatch(setRecording(false));
      return null;
    }
  };

  const handleToggleVideoStream = async (enabled) => {
    try {
      if (enabled) {
        await droneConnection.videoStream();
      } else {
        await droneConnection.stopVideoStream();
      }
    } catch (error) {
      console.error('Error toggling video stream:', error);
      Alert.alert('Error', 'Failed to toggle video stream. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} hidden={true} />
      <View style={styles.videoContainer}>
        <VideoFeed />
        <DroneControl 
          onTakeoff={() => console.log('Takeoff')}
          onLand={() => console.log('Land')}
          onEmergency={() => console.log('Emergency')}
          onCapturePhoto={handleCapturePhoto}
          onToggleRecording={handleToggleRecording}
          onToggleVideoStream={handleToggleVideoStream}
        />
        <DroneStateDisplay />
      </View>
      <VirtualJoystick
        onLeftJoystickMove={(data) => handleJoystickControl({ type: 'altitude', ...data })}
        onRightJoystickMove={(data) => handleJoystickControl({ type: 'movement', ...data })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    position: 'relative'
  },
  videoContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default App;