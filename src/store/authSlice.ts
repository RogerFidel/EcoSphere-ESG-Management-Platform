import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl: string;
  points: number;
  badgesEarned: string[];
  registeredDate: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('ecosphere_token'),
  user: localStorage.getItem('ecosphere_user') 
    ? JSON.parse(localStorage.getItem('ecosphere_user')!) 
    : null,
  isAuthenticated: !!localStorage.getItem('ecosphere_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('ecosphere_token', action.payload.token);
      localStorage.setItem('ecosphere_user', JSON.stringify(action.payload.user));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ecosphere_token');
      localStorage.removeItem('ecosphere_user');
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('ecosphere_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
