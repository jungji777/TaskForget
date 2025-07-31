import { create } from 'zustand';
import { WorkMode, WorkModeType, WorkModeSettings } from '../types';

interface WorkModeState {
  currentMode: WorkMode | null;
  isActive: boolean;
  timeRemaining: number; // in seconds
  isBreak: boolean;
  sessionCount: number;
  totalFocusTime: number; // in minutes
  totalBreakTime: number; // in minutes
  settings: Record<WorkModeType, WorkModeSettings>;
}

interface WorkModeActions {
  startWorkMode: (type: WorkModeType, customDuration?: number) => void;
  pauseWorkMode: () => void;
  resumeWorkMode: () => void;
  stopWorkMode: () => void;
  skipBreak: () => void;
  updateSettings: (type: WorkModeType, settings: Partial<WorkModeSettings>) => void;
  tick: () => void; // Called every second by timer
  reset: () => void;
}

type WorkModeStore = WorkModeState & WorkModeActions;

// Default settings for each work mode
const defaultSettings: Record<WorkModeType, WorkModeSettings> = {
  pomodoro: {
    autoStartBreaks: true,
    notifications: true,
    blockDistractions: false,
    playFocusMusic: false,
    trackTime: true,
    customDuration: 25, // 25 minutes
  },
  'deep-work': {
    autoStartBreaks: false,
    notifications: false,
    blockDistractions: true,
    playFocusMusic: true,
    trackTime: true,
    customDuration: 90, // 90 minutes
  },
  sprint: {
    autoStartBreaks: true,
    notifications: true,
    blockDistractions: false,
    playFocusMusic: false,
    trackTime: true,
    customDuration: 15, // 15 minutes
  },
  focus: {
    autoStartBreaks: false,
    notifications: false,
    blockDistractions: true,
    playFocusMusic: true,
    trackTime: true,
    customDuration: 45, // 45 minutes
  },
  break: {
    autoStartBreaks: false,
    notifications: true,
    blockDistractions: false,
    playFocusMusic: false,
    trackTime: false,
    customDuration: 5, // 5 minutes
  },
};

// Default durations for each work mode (in minutes)
const defaultDurations: Record<WorkModeType, number> = {
  pomodoro: 25,
  'deep-work': 90,
  sprint: 15,
  focus: 45,
  break: 5,
};

// Break durations for each work mode (in minutes)
const breakDurations: Record<WorkModeType, number> = {
  pomodoro: 5,
  'deep-work': 15,
  sprint: 3,
  focus: 10,
  break: 0,
};

export const useWorkModeStore = create<WorkModeStore>((set, get) => ({
  // Initial state
  currentMode: null,
  isActive: false,
  timeRemaining: 0,
  isBreak: false,
  sessionCount: 0,
  totalFocusTime: 0,
  totalBreakTime: 0,
  settings: defaultSettings,

  // Actions
  startWorkMode: (type: WorkModeType, customDuration?: number) => {
    const { settings } = get();
    const duration = customDuration || settings[type].customDuration || defaultDurations[type];
    
    const newMode: WorkMode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
      description: `${duration} minute ${type} session`,
      duration,
      breakDuration: breakDurations[type],
      settings: settings[type],
      isActive: true,
      startedAt: new Date(),
      userId: '1', // Current user ID
    };

    set({
      currentMode: newMode,
      isActive: true,
      timeRemaining: duration * 60, // Convert to seconds
      isBreak: false,
    });

    // Show notification if enabled
    if (settings[type].notifications && 'Notification' in window) {
      new Notification(`${newMode.name} Started`, {
        body: `Focus time: ${duration} minutes`,
        icon: '/favicon.ico',
      });
    }
  },

  pauseWorkMode: () => {
    const { currentMode } = get();
    if (currentMode) {
      set({
        isActive: false,
        currentMode: { ...currentMode, isActive: false },
      });
    }
  },

  resumeWorkMode: () => {
    const { currentMode } = get();
    if (currentMode) {
      set({
        isActive: true,
        currentMode: { ...currentMode, isActive: true },
      });
    }
  },

  stopWorkMode: () => {
    const { currentMode, isBreak, totalFocusTime, totalBreakTime } = get();
    
    if (currentMode) {
      const endedAt = new Date();
      const sessionDuration = currentMode.startedAt 
        ? Math.round((endedAt.getTime() - currentMode.startedAt.getTime()) / (1000 * 60))
        : 0;

      set({
        currentMode: { ...currentMode, isActive: false, endedAt },
        isActive: false,
        timeRemaining: 0,
        totalFocusTime: isBreak ? totalFocusTime : totalFocusTime + sessionDuration,
        totalBreakTime: isBreak ? totalBreakTime + sessionDuration : totalBreakTime,
      });

      // Show completion notification
      if (currentMode.settings.notifications && 'Notification' in window) {
        new Notification(`${currentMode.name} Completed`, {
          body: `Session duration: ${sessionDuration} minutes`,
          icon: '/favicon.ico',
        });
      }
    }
  },

  skipBreak: () => {
    const { currentMode, sessionCount } = get();
    
    if (currentMode && get().isBreak) {
      set({
        currentMode: null,
        isActive: false,
        timeRemaining: 0,
        isBreak: false,
        sessionCount: sessionCount + 1,
      });
    }
  },

  updateSettings: (type: WorkModeType, newSettings: Partial<WorkModeSettings>) => {
    const { settings } = get();
    set({
      settings: {
        ...settings,
        [type]: { ...settings[type], ...newSettings },
      },
    });
  },

  tick: () => {
    const { 
      timeRemaining, 
      isActive, 
      currentMode, 
      isBreak, 
      sessionCount,
      totalFocusTime,
      totalBreakTime,
      settings 
    } = get();
    
    if (!isActive || !currentMode) return;

    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    } else {
      // Time's up!
      const sessionDuration = currentMode.duration;
      
      if (!isBreak) {
        // Work session completed, start break if auto-start is enabled
        const newSessionCount = sessionCount + 1;
        const newTotalFocusTime = totalFocusTime + sessionDuration;
        
        if (currentMode.settings.autoStartBreaks && currentMode.breakDuration) {
          // Start break
          set({
            timeRemaining: currentMode.breakDuration * 60,
            isBreak: true,
            sessionCount: newSessionCount,
            totalFocusTime: newTotalFocusTime,
          });

          // Show break notification
          if (currentMode.settings.notifications && 'Notification' in window) {
            new Notification('Break Time!', {
              body: `Take a ${currentMode.breakDuration} minute break`,
              icon: '/favicon.ico',
            });
          }
        } else {
          // End session
          set({
            currentMode: { ...currentMode, isActive: false, endedAt: new Date() },
            isActive: false,
            timeRemaining: 0,
            sessionCount: newSessionCount,
            totalFocusTime: newTotalFocusTime,
          });

          // Show completion notification
          if (currentMode.settings.notifications && 'Notification' in window) {
            new Notification('Session Complete!', {
              body: `Great work! You focused for ${sessionDuration} minutes`,
              icon: '/favicon.ico',
            });
          }
        }
      } else {
        // Break completed
        const breakDuration = currentMode.breakDuration || 0;
        const newTotalBreakTime = totalBreakTime + breakDuration;
        
        set({
          currentMode: { ...currentMode, isActive: false, endedAt: new Date() },
          isActive: false,
          timeRemaining: 0,
          isBreak: false,
          totalBreakTime: newTotalBreakTime,
        });

        // Show break completion notification
        if (currentMode.settings.notifications && 'Notification' in window) {
          new Notification('Break Complete!', {
            body: 'Ready to get back to work?',
            icon: '/favicon.ico',
          });
        }
      }
    }
  },

  reset: () => {
    set({
      currentMode: null,
      isActive: false,
      timeRemaining: 0,
      isBreak: false,
      sessionCount: 0,
      totalFocusTime: 0,
      totalBreakTime: 0,
    });
  },
}));

// Timer hook to handle the countdown
let timerInterval: NodeJS.Timeout | null = null;

export const useWorkModeTimer = () => {
  const { isActive, tick } = useWorkModeStore();

  React.useEffect(() => {
    if (isActive) {
      timerInterval = setInterval(tick, 1000);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };
  }, [isActive, tick]);
};

// Request notification permission on first load
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}