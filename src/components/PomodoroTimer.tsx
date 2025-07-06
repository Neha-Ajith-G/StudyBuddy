import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Timer, Tag, Plus, Edit3, Check, X } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';
import StudyBuddy from './StudyBuddy';

const PomodoroTimer: React.FC = () => {
  const { state, dispatch } = usePomodoro();
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-blue-500');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = state.currentSession === 'work' 
      ? state.settings.workDuration * 60
      : state.currentSession === 'shortBreak'
      ? state.settings.shortBreakDuration * 60
      : state.settings.longBreakDuration * 60;
    
    return ((totalTime - state.timeLeft) / totalTime) * 100;
  };

  const handleStart = () => {
    dispatch({ type: 'START_TIMER' });
  };

  const handlePause = () => {
    dispatch({ type: 'PAUSE_TIMER' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TIMER' });
  };

  const handleSessionSwitch = (session: 'work' | 'shortBreak' | 'longBreak') => {
    dispatch({ type: 'SWITCH_SESSION', payload: session });
  };

  const handleTagSelect = (tag: any) => {
    dispatch({ type: 'SET_CURRENT_TAG', payload: tag });
    setShowTagSelector(false);
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const newTag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: newTagColor,
      };
      dispatch({ type: 'ADD_SESSION_TAG', payload: newTag });
      setNewTagName('');
      setIsCreatingTag(false);
    }
  };

  const getSessionColor = () => {
    switch (state.currentSession) {
      case 'work':
        return 'from-orange-400 to-red-400';
      case 'shortBreak':
        return 'from-green-400 to-teal-400';
      case 'longBreak':
        return 'from-purple-400 to-indigo-400';
      default:
        return 'from-orange-400 to-red-400';
    }
  };

  const getSessionIcon = () => {
    switch (state.currentSession) {
      case 'work':
        return <BookOpen className="w-5 h-5" />;
      case 'shortBreak':
        return <Coffee className="w-5 h-5" />;
      case 'longBreak':
        return <Timer className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const colorOptions = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
    'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timer Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Session Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-full p-1 flex">
              {['work', 'shortBreak', 'longBreak'].map((session) => (
                <button
                  key={session}
                  onClick={() => handleSessionSwitch(session as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    state.currentSession === session
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {session === 'work' ? 'Focus' : session === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Selector */}
          {state.currentSession === 'work' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Session Tag</label>
                <button
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Change
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${state.currentTag?.color || 'bg-gray-400'}`}></div>
                    <span className="font-medium text-gray-900">
                      {state.currentTag?.name || 'No tag selected'}
                    </span>
                  </div>
                  <Tag className="w-4 h-4 text-gray-500" />
                </button>

                {showTagSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <button
                        onClick={() => handleTagSelect(null)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        <span className="text-gray-600">No tag</span>
                      </button>
                      
                      {state.sessionTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagSelect(tag)}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
                          <span className="text-gray-900">{tag.name}</span>
                          {state.currentTag?.id === tag.id && (
                            <Check className="w-4 h-4 text-green-500 ml-auto" />
                          )}
                        </button>
                      ))}
                      
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        {isCreatingTag ? (
                          <div className="space-y-3 p-2">
                            <input
                              type="text"
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              placeholder="Tag name"
                              className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-400 outline-none"
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              {colorOptions.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setNewTagColor(color)}
                                  className={`w-6 h-6 rounded-full ${color} ${
                                    newTagColor === color ? 'ring-2 ring-gray-400' : ''
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleCreateTag}
                                className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                <Check className="w-3 h-3" />
                                <span>Create</span>
                              </button>
                              <button
                                onClick={() => {
                                  setIsCreatingTag(false);
                                  setNewTagName('');
                                }}
                                className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                              >
                                <X className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsCreatingTag(true)}
                            className="w-full flex items-center space-x-2 p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Create new tag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br ${getSessionColor()} shadow-2xl relative`}>
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 115}`}
                  strokeDashoffset={`${2 * Math.PI * 115 * (1 - getProgress() / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Time Display */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {formatTime(state.timeLeft)}
                </div>
                <div className="flex items-center justify-center text-white/80 text-sm">
                  {getSessionIcon()}
                  <span className="ml-2 capitalize">
                    {state.currentSession === 'shortBreak' ? 'Short Break' : 
                     state.currentSession === 'longBreak' ? 'Long Break' : 'Focus Time'}
                  </span>
                </div>
                {state.currentTag && state.currentSession === 'work' && (
                  <div className="flex items-center justify-center mt-2">
                    <div className={`w-2 h-2 rounded-full ${state.currentTag.color} mr-2`}></div>
                    <span className="text-white/80 text-xs">{state.currentTag.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={state.isActive ? handlePause : handleStart}
              className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              {state.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{state.isActive ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Session Info */}
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Session {state.sessionCount + 1} • {state.totalSessions} total sessions completed
            </p>
          </div>
        </div>

        {/* Study Buddy Animation */}
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center">
          <StudyBuddy 
            isActive={state.isActive} 
            session={state.currentSession}
            progress={getProgress()}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-2xl font-bold text-orange-600">{state.statistics.dailySessions}</div>
          <div className="text-sm text-gray-600">Today's Sessions</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-2xl font-bold text-green-600">{state.statistics.streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-2xl font-bold text-purple-600">{Math.floor(state.statistics.totalTime / 60)}h</div>
          <div className="text-sm text-gray-600">Total Time</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-md">
          <div className="text-2xl font-bold text-blue-600">{state.totalSessions}</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;