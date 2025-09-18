import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// App Mode Types
export const APP_MODES = {
  CANDIDATE: 'CANDIDATE',
  HR: 'HR'
};

// Action Types
const ActionTypes = {
  SET_MODE: 'SET_MODE',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT'
};

// Initial State
const initialState = {
  user: null,
  mode: APP_MODES.CANDIDATE,
  isLoading: false,
  error: null,
  isAuthenticated: false
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_MODE:
      return {
        ...state,
        mode: action.payload
      };
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case ActionTypes.LOGOUT:
      return {
        ...initialState
      };
    default:
      return state;
  }
}

// Create Context
const AppContext = createContext();

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved mode from storage
  useEffect(() => {
    loadSavedMode();
  }, []);

  const loadSavedMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('app_mode');
      if (savedMode && Object.values(APP_MODES).includes(savedMode)) {
        dispatch({ type: ActionTypes.SET_MODE, payload: savedMode });
      }
    } catch (error) {
      console.error('Error loading saved mode:', error);
    }
  };

  const switchMode = async (newMode) => {
    try {
      if (Object.values(APP_MODES).includes(newMode)) {
        await AsyncStorage.setItem('app_mode', newMode);
        dispatch({ type: ActionTypes.SET_MODE, payload: newMode });
      }
    } catch (error) {
      console.error('Error saving mode:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to switch mode' });
    }
  };

  const setUser = (user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  };

  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      dispatch({ type: ActionTypes.LOGOUT });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    ...state,
    switchMode,
    setUser,
    setLoading,
    setError,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
