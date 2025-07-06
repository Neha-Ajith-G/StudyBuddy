import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface SessionTag {
  id: string;
  name: string;
  color: string;
}

interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  currentSession: 'work' | 'shortBreak' | 'longBreak';
  sessionCount: number;
  totalSessions: number;
  currentTag: SessionTag | null;
  sessionTags: SessionTag[];
  sessionHistory: Array<{
    id: string;
    type: 'work' | 'shortBreak' | 'longBreak';
    tag: SessionTag | null;
    duration: number;
    completedAt: Date;
  }>;
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    autoStart: boolean;
    soundEnabled: boolean;
    defaultTag: string | null;
  };
  statistics: {
    dailySessions: number;
    weeklySessions: number;
    totalTime: number;
    streak: number;
    lastSessionDate: string;
  };
}

type PomodoroAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'SWITCH_SESSION'; payload: 'work' | 'shortBreak' | 'longBreak' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PomodoroState['settings']> }
  | { type: 'SET_CURRENT_TAG'; payload: SessionTag | null }
  | { type: 'ADD_SESSION_TAG'; payload: SessionTag }
  | { type: 'UPDATE_SESSION_TAG'; payload: { id: string; updates: Partial<SessionTag> } }
  | { type: 'DELETE_SESSION_TAG'; payload: string }
  | { type: 'LOAD_STATE'; payload: PomodoroState };

const defaultTags: SessionTag[] = [
  { id: 'study', name: 'Study', color: 'bg-blue-500' },
  { id: 'work', name: 'Work', color: 'bg-green-500' },
  { id: 'reading', name: 'Reading', color: 'bg-purple-500' },
  { id: 'coding', name: 'Coding', color: 'bg-orange-500' },
  { id: 'research', name: 'Research', color: 'bg-teal-500' },
];

const initialState: PomodoroState = {
  timeLeft: 25 * 60, // 25 minutes
  isActive: false,
  currentSession: 'work',
  sessionCount: 0,
  totalSessions: 0,
  currentTag: defaultTags[0], // Default to 'Study'
  sessionTags: defaultTags,
  sessionHistory: [],
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStart: false,
    soundEnabled: true,
    defaultTag: 'study',
  },
  statistics: {
    dailySessions: 0,
    weeklySessions: 0,
    totalTime: 0,
    streak: 0,
    lastSessionDate: new Date().toDateString(),
  },
};

const pomodoroReducer = (state: PomodoroState, action: PomodoroAction): PomodoroState => {
  switch (action.type) {
    case 'START_TIMER':
      return { ...state, isActive: true };
    
    case 'PAUSE_TIMER':
      return { ...state, isActive: false };
    
    case 'RESET_TIMER':
      const duration = state.currentSession === 'work' 
        ? state.settings.workDuration 
        : state.currentSession === 'shortBreak'
        ? state.settings.shortBreakDuration
        : state.settings.longBreakDuration;
      return {
        ...state,
        timeLeft: duration * 60,
        isActive: false,
      };
    
    case 'TICK':
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1),
      };
    
    case 'COMPLETE_SESSION':
      const newSessionCount = state.sessionCount + 1;
      const newTotalSessions = state.totalSessions + 1;
      const isLongBreakTime = newSessionCount % state.settings.longBreakInterval === 0;
      
      let nextSession: 'work' | 'shortBreak' | 'longBreak' = 'work';
      if (state.currentSession === 'work') {
        nextSession = isLongBreakTime ? 'longBreak' : 'shortBreak';
      }
      
      const nextDuration = nextSession === 'work' 
        ? state.settings.workDuration 
        : nextSession === 'shortBreak'
        ? state.settings.shortBreakDuration
        : state.settings.longBreakDuration;
      
      const today = new Date().toDateString();
      const isNewDay = state.statistics.lastSessionDate !== today;
      
      // Add completed session to history
      const completedSession = {
        id: Date.now().toString(),
        type: state.currentSession,
        tag: state.currentTag,
        duration: state.currentSession === 'work' ? state.settings.workDuration : 
                 state.currentSession === 'shortBreak' ? state.settings.shortBreakDuration : 
                 state.settings.longBreakDuration,
        completedAt: new Date(),
      };
      
      return {
        ...state,
        timeLeft: nextDuration * 60,
        isActive: state.settings.autoStart,
        currentSession: nextSession,
        sessionCount: newSessionCount,
        totalSessions: newTotalSessions,
        sessionHistory: [completedSession, ...state.sessionHistory.slice(0, 99)], // Keep last 100 sessions
        statistics: {
          ...state.statistics,
          dailySessions: isNewDay ? 1 : state.statistics.dailySessions + 1,
          weeklySessions: state.statistics.weeklySessions + 1,
          totalTime: state.statistics.totalTime + (state.currentSession === 'work' ? state.settings.workDuration : 0),
          streak: isNewDay ? (state.statistics.dailySessions > 0 ? state.statistics.streak + 1 : 1) : state.statistics.streak,
          lastSessionDate: today,
        },
      };
    
    case 'SWITCH_SESSION':
      const sessionDuration = action.payload === 'work' 
        ? state.settings.workDuration 
        : action.payload === 'shortBreak'
        ? state.settings.shortBreakDuration
        : state.settings.longBreakDuration;
      
      return {
        ...state,
        currentSession: action.payload,
        timeLeft: sessionDuration * 60,
        isActive: false,
      };
    
    case 'UPDATE_SETTINGS':
      let newCurrentTag = state.currentTag;
      
      // If default tag is being updated, update current tag if it matches
      if (action.payload.defaultTag && action.payload.defaultTag !== state.settings.defaultTag) {
        const defaultTag = state.sessionTags.find(tag => tag.id === action.payload.defaultTag);
        if (defaultTag) {
          newCurrentTag = defaultTag;
        }
      }
      
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        currentTag: newCurrentTag,
      };
    
    case 'SET_CURRENT_TAG':
      return {
        ...state,
        currentTag: action.payload,
      };
    
    case 'ADD_SESSION_TAG':
      return {
        ...state,
        sessionTags: [...state.sessionTags, action.payload],
      };
    
    case 'UPDATE_SESSION_TAG':
      return {
        ...state,
        sessionTags: state.sessionTags.map(tag =>
          tag.id === action.payload.id ? { ...tag, ...action.payload.updates } : tag
        ),
        currentTag: state.currentTag?.id === action.payload.id 
          ? { ...state.currentTag, ...action.payload.updates }
          : state.currentTag,
      };
    
    case 'DELETE_SESSION_TAG':
      const filteredTags = state.sessionTags.filter(tag => tag.id !== action.payload);
      return {
        ...state,
        sessionTags: filteredTags,
        currentTag: state.currentTag?.id === action.payload ? filteredTags[0] || null : state.currentTag,
        settings: {
          ...state.settings,
          defaultTag: state.settings.defaultTag === action.payload ? filteredTags[0]?.id || null : state.settings.defaultTag,
        },
      };
    
    case 'LOAD_STATE':
      return action.payload;
    
    default:
      return state;
  }
};

const PomodoroContext = createContext<{
  state: PomodoroState;
  dispatch: React.Dispatch<PomodoroAction>;
} | null>(null);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Ensure sessionHistory dates are properly parsed
        if (parsedState.sessionHistory) {
          parsedState.sessionHistory = parsedState.sessionHistory.map((session: any) => ({
            ...session,
            completedAt: new Date(session.completedAt),
          }));
        }
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }, [state]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isActive && state.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (state.isActive && state.timeLeft === 0) {
      // Session completed
      dispatch({ type: 'COMPLETE_SESSION' });
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const sessionName = state.currentSession === 'work' ? 'Work' : 'Break';
        const tagName = state.currentTag ? ` (${state.currentTag.name})` : '';
        new Notification(`${sessionName} session completed!${tagName}`, {
          body: 'Time to switch!',
          icon: '/vite.svg',
        });
      }
      
      // Play sound if enabled
      if (state.settings.soundEnabled) {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isActive, state.timeLeft, state.currentSession, state.settings.soundEnabled, state.currentTag]);

  return (
    <PomodoroContext.Provider value={{ state, dispatch }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};