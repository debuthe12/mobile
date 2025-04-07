import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { setConnectionStatus, setStreamEnabled } from '@store/slices/droneSlice';
import { savePhoto, saveVideo } from '../utils/storage';
import droneConnection from '../services/droneConnection';

const DroneControl = ({ 
  onTakeoff,
  onLand,
  onEmergency,
  onCapturePhoto,
  onToggleRecording,
  onToggleVideoStream
}) => {
  const dispatch = useDispatch();
  const { isConnected, streamEnabled, isRecording } = useSelector(state => state.drone);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const emergencyPulseAnim = useRef(new Animated.Value(0)).current;
  const videoPulseAnim = useRef(new Animated.Value(0)).current;

  const handleConnect = async () => {
    try {
      if (!isConnected) {
        await droneConnection.connect();
      } else {
        droneConnection.disconnect();
      }
    } catch (error) {
      console.error('Failed to connect to drone:', error);
      dispatch(setConnectionStatus(false));
    }
  };

  const handleTakeoff = async () => {
    try {
      if (!isConnected) {
        console.error('Drone not connected');
        return;
      }
      await droneConnection.sendCommand('takeoff');
      onTakeoff();
    } catch (error) {
      console.error('Failed to takeoff:', error);
    }
  };

  const handleLand = async () => {
    try {
      if (!isConnected) {
        console.error('Drone not connected');
        return;
      }
      await droneConnection.sendCommand('land');
      onLand();
    } catch (error) {
      console.error('Failed to land:', error);
    }
  };

  const handleEmergency = async () => {
    try {
      if (!isConnected) {
        console.error('Drone not connected');
        return;
      }
      await droneConnection.sendCommand('emergency');
      onEmergency();
    } catch (error) {
      console.error('Failed to execute emergency command:', error);
    }
  };

  const handleStream = async () => {
    try {
      if (!streamEnabled) {
        await droneConnection.videoStream();
        onToggleVideoStream(true);
      } else {
        await droneConnection.stopVideoStream();
        onToggleVideoStream(false);
      }
    } catch (error) {
      console.error('Failed to toggle video stream:', error);
      dispatch(setStreamEnabled(false));
      onToggleVideoStream(false);
    }
  };

  // Add new handlers for photo and video capture
  const handlePhotoCapture = async () => {
    try {
      if (!isConnected || !streamEnabled) {
        console.error('Drone not connected or stream not enabled');
        return;
      }
      const photoData = await onCapturePhoto();
      
      if (photoData) {
        const savedPath = await savePhoto(photoData, 'drone_capture');
        console.log('Photo saved successfully at:', savedPath);
      }
    } catch (error) {
      console.error('Failed to capture and save photo:', error);
    }
  };

  // Track recording state and file path
  const recordingRef = useRef({
    videoData: null,
    startTime: null
  });

  const handleRecordingToggle = async () => {
    try {
      if (!isConnected || !streamEnabled) {
        console.error('Drone not connected or stream not enabled');
        return;
      }

      if (!isRecording) {
        recordingRef.current.startTime = Date.now();
        await onToggleRecording(true);
      } else {
        const videoData = await onToggleRecording(false);
        if (videoData) {
          const fileName = `drone_recording_${recordingRef.current.startTime}`;
          const savedPath = await saveVideo(videoData, fileName);
          console.log('Video saved successfully at:', savedPath);
        }
      }
    } catch (error) {
      console.error('Failed to handle recording:', error);
    }
  };

  useEffect(() => {
    // Connect button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Emergency button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(emergencyPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(emergencyPulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Video status pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(videoPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(videoPulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <>
      {/* Left side control buttons */}
      <View style={{
        position: 'absolute',
        top: 20,
        left: 32,
        zIndex: 10,
        flexDirection: 'row',
        gap: 12,
      }}>
        {/* Takeoff button */}
        <Pressable
          onPress={handleTakeoff}
          disabled={!isConnected}
          style={({ pressed }) => ({
            padding: 10,
            backgroundColor: 'transparent',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isConnected ? 'rgba(16, 185, 129, 0.5)' : 'rgba(107, 114, 128, 0.3)',
            opacity: isConnected ? (pressed ? 0.7 : 1) : 0.5,
            transform: [{ scale: pressed ? 1.05 : 1 }],
          })}
        >
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            stroke={isConnected ? "rgb(52, 211, 153)" : "rgb(156, 163, 175)"}
            fill="none"
          >
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </Svg>
        </Pressable>

        {/* Land button */}
        <Pressable
          onPress={handleLand}
          disabled={!isConnected}
          style={({ pressed }) => ({
            padding: 10,
            backgroundColor: 'transparent',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isConnected ? 'rgba(14, 165, 233, 0.5)' : 'rgba(107, 114, 128, 0.3)',
            opacity: isConnected ? (pressed ? 0.7 : 1) : 0.5,
            transform: [{ scale: pressed ? 1.05 : 1 }],
          })}
        >
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            stroke={isConnected ? "rgb(56, 189, 248)" : "rgb(156, 163, 175)"}
            fill="none"
          >
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </Svg>
        </Pressable>

        {/* Emergency button */}
        <Pressable
          onPress={handleEmergency}
          disabled={!isConnected}
          style={({ pressed }) => ({
            padding: 10,
            backgroundColor: 'transparent',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isConnected ? 'rgba(239, 68, 68, 0.5)' : 'rgba(107, 114, 128, 0.3)',
            opacity: isConnected ? (pressed ? 0.7 : 1) : 0.5,
            transform: [{ scale: pressed ? 1.05 : 1 }],
          })}
        >
          <Animated.View style={{
            opacity: isConnected ? emergencyPulseAnim : 1,
          }}>
            <Svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              stroke={isConnected ? "rgb(248, 113, 113)" : "rgb(156, 163, 175)"}
              fill="none"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </Svg>
          </Animated.View>
        </Pressable>
      </View>

      {/* Center buttons */}
      <View style={{ 
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        zIndex: 10,
      }}>
        <View style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 12,
        }}>
          {/* Connect button */}
          <Pressable
            onPress={handleConnect}
            style={({ pressed }) => ({
              paddingVertical: 2,
              paddingHorizontal: 5,
              backgroundColor: 'transparent',
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isConnected ? '#10b981' : '#ff0000',
                  transform: [{ scale }],
                  opacity,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isConnected ? '#10b981' : '#ff0000',
                }}
              />
            </View>
            <Svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              stroke="white"
              fill="none"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </Svg>
            <Text style={{
              color: 'white',
              fontSize: 10,
              fontWeight: '500',
            }}>
              {isConnected ? 'Connected' : 'Connect'}
            </Text>
          </Pressable>

          {/* Video Stream Button */}
          {isConnected && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: streamEnabled ? '#0ea5e9' : '#ef4444',
                    transform: [{ scale }],
                    opacity: videoPulseAnim,
                  }}
                />
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: streamEnabled ? '#0ea5e9' : '#ef4444',
                  }}
                />
              </View>
              
              <Pressable
                onPress={handleStream}
                style={({ pressed }) => ({
                  paddingVertical: 2,
                  paddingHorizontal: 5,
                  backgroundColor: pressed ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 9999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                })}
              >
                <Svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  stroke="white"
                  fill="none"
                >
                  {streamEnabled ? (
                    <Path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 9v6m4-6v6"
                    />
                  ) : (
                    <Path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  )}
                </Svg>
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: '500',
                }}>
                  {streamEnabled ? 'Stop Video' : 'Start Video'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Capture and Record buttons on right */}
        <View style={{
          position: 'absolute',
          right: 20,
          top: 0,
          flexDirection: 'row',
          gap: 12,
        }}>
          <Pressable
            onPress={handlePhotoCapture}
            disabled={!streamEnabled}
            style={({ pressed }) => ({
              paddingVertical: 2,
              paddingHorizontal: 5,
              backgroundColor: 'transparent',
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: streamEnabled ? (pressed ? 0.7 : 1) : 0.5,
              borderWidth: 1,
              borderColor: streamEnabled ? 'rgba(16, 185, 129, 0.5)' : 'rgba(107, 114, 128, 0.3)',
            })}
          >
            <Svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              stroke={streamEnabled ? "rgb(52, 211, 153)" : "rgb(156, 163, 175)"}
              fill="none"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </Svg>
            <Text style={{
              color: 'white',
              fontSize: 10,
              fontWeight: '500',
            }}>
              Capture
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRecordingToggle}
            disabled={!streamEnabled}
            style={({ pressed }) => ({
              paddingVertical: 2,
              paddingHorizontal: 5,
              backgroundColor: 'transparent',
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: streamEnabled ? (pressed ? 0.7 : 1) : 0.5,
              borderWidth: 1,
              borderColor: streamEnabled
                ? isRecording 
                  ? 'rgba(239, 68, 68, 0.5)'
                  : 'rgba(14, 165, 233, 0.5)'
                : 'rgba(107, 114, 128, 0.3)',
            })}
          >
            <Svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              stroke={
                streamEnabled
                  ? isRecording 
                    ? "rgb(248, 113, 113)"
                    : "rgb(56, 189, 248)"
                  : "rgb(156, 163, 175)"
              }
              fill="none"
            >
              {isRecording ? (
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 9v6m4-6v6"
                />
              ) : (
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              )}
            </Svg>
            <Text style={{
              color: 'white',
              fontSize: 10,
              fontWeight: '500',
            }}>
              {isRecording ? 'Stop' : 'Record'}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default DroneControl; 