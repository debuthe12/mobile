import { configureStore } from '@reduxjs/toolkit';
import droneReducer from '@store/slices/droneSlice';

export const store = configureStore({
  reducer: {
    drone: droneReducer,
  },
}); 