import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string;
  picture: string;
  isAuthenticated: boolean;
}

const initialState: UserState = (() => {
  if (typeof window !== 'undefined') {  // Check if running in browser
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        const picture = decoded.picture || '';
        
        // Log for debugging purposes
        if (picture) {
          console.log('User picture found in token:', picture.substring(0, 50) + '...');
        }
        
        return {
          email: decoded.email || '',
          picture,
          isAuthenticated: true,
        };
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }
  return {
    email: '',
    picture: '',
    isAuthenticated: false,
  };
})();

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ email: string; picture: string }>) => {
      const { email, picture } = action.payload;
      
      // Only update if the new values are different
      if (state.email !== email || state.picture !== picture) {
        state.email = email;
        state.picture = picture;
        state.isAuthenticated = true;
        
        // Log for debugging
        if (picture) {
          console.log('User picture updated in Redux:', picture.substring(0, 50) + '...');
        }
      }
    },
    updateUserPicture: (state, action: PayloadAction<string>) => {
      if (state.picture !== action.payload) {
        state.picture = action.payload;
        console.log('User picture updated separately:', action.payload.substring(0, 50) + '...');
      }
    },
    logout: (state) => {
      state.email = '';
      state.picture = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUserPicture, logout } = userSlice.actions;
export default userSlice.reducer; 