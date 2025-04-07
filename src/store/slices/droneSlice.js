import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
  isStreaming: false,
  error: null,
  streamEnabled: false,
  isRecording: false,
  droneState: {
    battery: null,
    flightTime: null,
    lastUpdate: null
  }
};

export const droneSlice = createSlice({
  name: 'drone',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    updateDroneState: (state, action) => {
      const { battery, flightTime } = action.payload;
      state.droneState.battery = battery;
      state.droneState.flightTime = flightTime;
      state.droneState.lastUpdate = new Date().toISOString();
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setStreamEnabled: (state, action) => {
      state.streamEnabled = action.payload;
    },
    setRecording: (state, action) => {
      state.isRecording = action.payload;
    },
  },
});

export const { 
  setConnectionStatus, 
  updateDroneState, 
  setError,
  setStreamEnabled,
  setRecording
} = droneSlice.actions;

export default droneSlice.reducer; 