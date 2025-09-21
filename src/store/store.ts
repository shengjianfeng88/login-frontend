import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import historyReducer from './features/historySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 