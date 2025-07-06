import React from 'react';
import { Volume2, VolumeX, Download, Upload, RotateCcw, Tag, Edit3, Trash2, Plus } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';

const SettingsPanel: React.FC = () => {
  const { state, dispatch } = usePomodoro();

  const handleSettingChange = (setting: string, value: any) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [setting]: value },
    });
  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      dispatch({ type: 'DELETE_SESSION_TAG', payload: tagId });
    }
  };

  const handleExportData = () => {
    const data = {
      settings: state.settings,
      statistics: state.statistics,
      sessionTags: state.sessionTags,
      sessionHistory: state.sessionHistory,
      notes: JSON.parse(localStorage.getItem('studyBuddyNotes') || '[]'),
      tasks: JSON.parse(localStorage.getItem('studyBuddyTasks') || '[]'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studybuddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.settings) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: data.settings });
          }
          if (data.sessionTags) {
            // Load session tags
            data.sessionTags.forEach((tag: any) => {
              dispatch({ type: 'ADD_SESSION_TAG', payload: tag });
            });
          }
          if (data.notes) {
            localStorage.setItem('studyBuddyNotes', JSON.stringify(data.notes));
          }
          if (data.tasks) {
            localStorage.setItem('studyBuddyTasks', JSON.stringify(data.tasks));
          }
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('pomodoroState');
      localStorage.removeItem('studyBuddyNotes');
      localStorage.removeItem('studyBuddyTasks');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your StudyBuddy experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timer Settings */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Timer Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Session Duration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={state.settings.workDuration}
                  onChange={(e) => handleSettingChange('workDuration', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {state.settings.workDuration} min
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Break Duration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={state.settings.shortBreakDuration}
                  onChange={(e) => handleSettingChange('shortBreakDuration', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {state.settings.shortBreakDuration} min
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Break Duration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="15"
                  max="30"
                  value={state.settings.longBreakDuration}
                  onChange={(e) => handleSettingChange('longBreakDuration', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {state.settings.longBreakDuration} min
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Break Interval
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={state.settings.longBreakInterval}
                  onChange={(e) => handleSettingChange('longBreakInterval', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {state.settings.longBreakInterval} sessions
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Session Tag
              </label>
              <select
                value={state.settings.defaultTag || ''}
                onChange={(e) => handleSettingChange('defaultTag', e.target.value || null)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-orange-400 outline-none"
              >
                <option value="">No default tag</option>
                {state.sessionTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Session Tags Management */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Session Tags</h2>
          
          <div className="space-y-4">
            {state.sessionTags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
                  <span className="font-medium text-gray-900">{tag.name}</span>
                  {state.settings.defaultTag === tag.id && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    disabled={state.sessionTags.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Auto-start next session</h3>
                <p className="text-sm text-gray-600">Automatically start the next session after a break</p>
              </div>
              <button
                onClick={() => handleSettingChange('autoStart', !state.settings.autoStart)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  state.settings.autoStart ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    state.settings.autoStart ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Sound notifications</h3>
                <p className="text-sm text-gray-600">Play sound when sessions complete</p>
              </div>
              <button
                onClick={() => handleSettingChange('soundEnabled', !state.settings.soundEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  state.settings.soundEnabled ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    state.settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {state.settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {state.settings.soundEnabled ? 'Sound enabled' : 'Sound disabled'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    Browser notifications enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Data Management</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full justify-center"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
            
            <label className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors w-full justify-center cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleResetData}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors w-full justify-center"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Data</span>
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">About Data Storage</h3>
            <p className="text-sm text-gray-600">
              Your data is stored locally in your browser. Export your data regularly to avoid losing it.
            </p>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-6">App Information</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{state.totalSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(state.statistics.totalTime / 60)}h {state.statistics.totalTime % 60}m
              </div>
              <div className="text-sm text-gray-600">Total Study Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{state.statistics.streak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{state.sessionTags.length}</div>
              <div className="text-sm text-gray-600">Session Tags</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">StudyBuddy v1.0.0</h3>
            <p className="text-sm text-gray-600">
              Your friendly Pomodoro companion for focused learning and productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;