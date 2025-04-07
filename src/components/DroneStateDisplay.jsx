import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import droneConnection from '../services/droneConnection';
import { updateDroneState } from '../store/slices/droneSlice';

const DroneStateDisplay = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { droneState } = useSelector(state => state.drone);
  const { battery, flightTime, lastUpdate } = droneState || {};

  useEffect(() => {
    // Set up event listeners for battery and flight time updates
    const handleBattery = (batteryLevel) => {
      dispatch(updateDroneState({
        battery: batteryLevel,
        flightTime: droneState?.flightTime,
        lastUpdate: new Date().toISOString()
      }));
    };

    const handleFlightTime = (time) => {
      dispatch(updateDroneState({
        battery: droneState?.battery,
        flightTime: time,
        lastUpdate: new Date().toISOString()
      }));
    };

    // Subscribe to drone events
    droneConnection.on('battery', handleBattery);
    droneConnection.on('flightTime', handleFlightTime);

    // Cleanup listeners on unmount
    return () => {
      droneConnection.removeListener('battery', handleBattery);
      droneConnection.removeListener('flightTime', handleFlightTime);
    };
  }, [dispatch, droneState]);

  const getBatteryColor = () => {
    if (!battery) return 'rgb(107, 114, 128)'; // gray-500
    if (battery < 20) return 'rgba(248, 113, 113, 0.9)'; // red-400/90
    if (battery < 50) return 'rgba(250, 204, 21, 0.9)'; // yellow-400/90
    return 'rgba(74, 222, 128, 0.9)'; // green-400/90
  };

  const StatusBox = ({ icon, value, color, bgColor }) => (
    <View style={{
      backgroundColor: 'transparent',
      borderRadius: 8,
      padding: 8,
      backgroundColor: 'transparent',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}>
        <Svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          stroke={color}
          fill="none"
        >
          {icon}
        </Svg>
        <View style={{
          backgroundColor: 'transparent',
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 4,
          minWidth: 60,
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            fontFamily: 'monospace',
            color: color,
          }}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {/* Gallery Button */}
      <View style={{
        position: 'absolute',
        top: 15,
        right: 40,
        zIndex: 30,
      }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('DroneMedia')}
        >
          <StatusBox
            icon={
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            }
            value="Gallery"
            color="rgba(59, 130, 246, 0.9)" // blue-500/90
            bgColor="transparent"
          />
        </TouchableOpacity>
      </View>

      {/* Battery Display */}
      <View style={{
        position: 'absolute',
        top: 15,
        left: 190,
        zIndex: 30,
      }}>
        <StatusBox
          icon={
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7h14a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm14 1h2v6h-2V8z"
            />
          }
          value={battery ? `${battery}%` : ''}
          color={getBatteryColor()}
          bgColor="transparent"
        />
      </View>

      {/* Flight Time Display */}
      <View style={{
        position: 'absolute',
        top: 50,
        right: 40,
        zIndex: 30,
      }}>
        <StatusBox
          icon={
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
          value={flightTime || ''}
          color="rgba(168, 85, 247, 0.9)" // purple-400/90
          bgColor="rgba(168, 85, 247, 0.1)" // purple-500/10
        />
      </View>

      {/* Last Update Display */}
      <View style={{
        position: 'absolute',
        top: 80,
        right: 40,
        zIndex: 30,
      }}>
        <StatusBox
          icon={
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          }
          value={lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : ''}
          color="rgba(251, 191, 36, 0.9)" // amber-400/90
          bgColor="rgba(251, 191, 36, 0.1)" // amber-500/10
        />
      </View>
    </>
  );
};

export default DroneStateDisplay; 