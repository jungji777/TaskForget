import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Settings,
  Timer,
  Coffee,
  Brain,
  Zap,
  Target,
} from 'lucide-react';
import { useWorkModeStore } from '../../store/workModeStore';
import { WorkModeType } from '../../types';
import { clsx } from 'clsx';

const workModeIcons: Record<WorkModeType, React.ComponentType<any>> = {
  pomodoro: Timer,
  'deep-work': Brain,
  sprint: Zap,
  focus: Target,
  break: Coffee,
};

const workModeColors: Record<WorkModeType, string> = {
  pomodoro: 'bg-red-500',
  'deep-work': 'bg-purple-500',
  sprint: 'bg-blue-500',
  focus: 'bg-green-500',
  break: 'bg-orange-500',
};

export const WorkModeTimer: React.FC = () => {
  const {
    currentMode,
    isActive,
    timeRemaining,
    isBreak,
    sessionCount,
    totalFocusTime,
    totalBreakTime,
    startWorkMode,
    pauseWorkMode,
    resumeWorkMode,
    stopWorkMode,
    skipBreak,
    settings,
  } = useWorkModeStore();

  const [selectedMode, setSelectedMode] = useState<WorkModeType>('pomodoro');
  const [showSettings, setShowSettings] = useState(false);
  const [customDuration, setCustomDuration] = useState<number>(25);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleStart = () => {
    if (currentMode && !isActive) {
      resumeWorkMode();
    } else {
      startWorkMode(selectedMode, customDuration);
    }
  };

  const handlePause = () => {
    pauseWorkMode();
  };

  const handleStop = () => {
    stopWorkMode();
  };

  const handleSkipBreak = () => {
    skipBreak();
  };

  const workModeOptions: { type: WorkModeType; name: string; description: string; defaultDuration: number }[] = [
    {
      type: 'pomodoro',
      name: 'Pomodoro',
      description: 'Classic 25-minute focus sessions with 5-minute breaks',
      defaultDuration: 25,
    },
    {
      type: 'deep-work',
      name: 'Deep Work',
      description: 'Extended 90-minute sessions for complex tasks',
      defaultDuration: 90,
    },
    {
      type: 'sprint',
      name: 'Sprint',
      description: 'Quick 15-minute bursts for small tasks',
      defaultDuration: 15,
    },
    {
      type: 'focus',
      name: 'Focus',
      description: 'Balanced 45-minute sessions with longer breaks',
      defaultDuration: 45,
    },
  ];

  const selectedModeConfig = workModeOptions.find(mode => mode.type === selectedMode);
  const Icon = workModeIcons[selectedMode];
  const modeColor = workModeColors[selectedMode];

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Work Mode Timer</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mode Selection */}
        {!currentMode && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Work Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {workModeOptions.map((mode) => {
                const ModeIcon = workModeIcons[mode.type];
                const isSelected = selectedMode === mode.type;
                
                return (
                  <button
                    key={mode.type}
                    onClick={() => {
                      setSelectedMode(mode.type);
                      setCustomDuration(mode.defaultDuration);
                    }}
                    className={clsx(
                      'p-3 rounded-lg border text-left transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center mb-2">
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center mr-3',
                        isSelected ? 'bg-primary-100' : 'bg-gray-100'
                      )}>
                        <ModeIcon className={clsx(
                          'w-4 h-4',
                          isSelected ? 'text-primary-600' : 'text-gray-600'
                        )} />
                      </div>
                      <span className="font-medium">{mode.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {mode.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Duration */}
        {!currentMode && selectedModeConfig && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={customDuration}
              onChange={(e) => setCustomDuration(parseInt(e.target.value) || selectedModeConfig.defaultDuration)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}

        {/* Timer Display */}
        {currentMode && (
          <div className="text-center mb-6">
            <div className={clsx(
              'w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 relative',
              modeColor
            )}>
              <div className="text-white">
                <Icon className="w-8 h-8 mb-2" />
                <div className="text-2xl font-bold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
              
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="white"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - (timeRemaining / (currentMode.duration * 60)))}`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isBreak ? 'Break Time' : currentMode.name}
            </h3>
            <p className="text-sm text-gray-600">
              {isBreak ? 'Take a well-deserved break' : 'Stay focused and productive'}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-3 mb-6">
          {!currentMode ? (
            <button
              onClick={handleStart}
              className="btn-primary flex items-center px-6 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start {selectedModeConfig?.name}
            </button>
          ) : (
            <>
              <button
                onClick={isActive ? handlePause : handleStart}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg font-medium transition-colors',
                  isActive
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                )}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </button>

              <button
                onClick={handleStop}
                className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </button>

              {isBreak && (
                <button
                  onClick={handleSkipBreak}
                  className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </button>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{sessionCount}</div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(totalFocusTime)}
            </div>
            <div className="text-xs text-gray-600">Focus Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatDuration(totalBreakTime)}
            </div>
            <div className="text-xs text-gray-600">Break Time</div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings[selectedMode]?.notifications || false}
                  onChange={(e) => {
                    // Update settings would go here
                    console.log('Toggle notifications:', e.target.checked);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable notifications
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings[selectedMode]?.autoStartBreaks || false}
                  onChange={(e) => {
                    // Update settings would go here
                    console.log('Toggle auto-start breaks:', e.target.checked);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Auto-start breaks
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings[selectedMode]?.trackTime || false}
                  onChange={(e) => {
                    // Update settings would go here
                    console.log('Toggle time tracking:', e.target.checked);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Track time automatically
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};