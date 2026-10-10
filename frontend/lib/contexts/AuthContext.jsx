'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../api';
import { tokenService } from '../tokenService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const token = tokenService.getToken();
    const user = tokenService.getUser();

    if (token && user && !tokenService.isTokenExpired()) {
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: user,
      });
    } else {
      // Clear expired or invalid data
      tokenService.clearAuthData();
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: null,
      });
    }
  }, []);

  // Login action
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      // Wrap credentials in auth key if not already wrapped
      const payload = credentials.auth ? credentials : { auth: credentials };
      const response = await apiService.auth.login(payload);
      const { user, token, refresh_token } = response.data;

      tokenService.setToken(token);
      tokenService.setUser(user);
      if (refresh_token) {
        tokenService.setRefreshToken(refresh_token);
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, user };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register action
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      // Wrap userData in auth key if not already wrapped
      const payload = userData.auth ? userData : { auth: userData };
      const response = await apiService.auth.register(payload);
      const { user, token, refresh_token, message } = response.data;

      // If token is provided, log them in
      if (token) {
        tokenService.setToken(token);
        tokenService.setUser(user);
        if (refresh_token) {
          tokenService.setRefreshToken(refresh_token);
        }

        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: { user, token },
        });
      } else {
        // Registration successful
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: { user: user || null, token: null },
        });
      }

      return { success: true, message: message || 'Registration successful', user };
    } catch (error) {
      console.error('Registration API Error:', error.response?.data);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.details) ? error.response?.data?.details.join(', ') : null) || 
                          'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenService.clearAuthData();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Demo login helpers for effortless previewing
  const loginDemoVendor = () => {
    const mockVendorUser = {
      id: 'v1',
      first_name: 'Aarav',
      last_name: 'Sharma',
      email: 'aarav@weddingnarratives.in',
      role: 'vendor',
      business_name: 'The Wedding Narratives'
    };
    const mockToken = 'demo_vendor_token_123';
    tokenService.setToken(mockToken);
    tokenService.setUser(mockVendorUser);
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: mockVendorUser, token: mockToken }
    });
    return { success: true };
  };

  const loginDemoCustomer = () => {
    const mockCustomerUser = {
      id: 'c1',
      first_name: 'Priya',
      last_name: 'Verma',
      email: 'priya@example.com',
      role: 'customer'
    };
    const mockToken = 'demo_customer_token_123';
    tokenService.setToken(mockToken);
    tokenService.setUser(mockCustomerUser);
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: mockCustomerUser, token: mockToken }
    });
    return { success: true };
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const updateUser = (updatedUserData) => {
    const currentUser = tokenService.getUser() || state.user || {};
    const newUser = { ...currentUser, ...updatedUserData };
    tokenService.setUser(newUser);
    dispatch({
      type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
      payload: newUser,
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    loginDemoVendor,
    loginDemoCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;