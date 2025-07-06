import React, { useState, useEffect } from 'react';
import { Timer, BookOpen, BarChart3, Settings, Calendar, Bell } from 'lucide-react';
import PomodoroTimer from './components/PomodoroTimer';
import Notes from './components/Notes';
import Statistics from './components/Statistics';
import TaskManager from './components/TaskManager';
import SettingsPanel from './components/SettingsPanel';
import { PomodoroProvider } from './contexts/PomodoroContext';

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission === 'granted');
      });
    }
  }, []);

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return <PomodoroTimer />;
      case 'notes':
        return <Notes />;
      case 'tasks':
        return <TaskManager />;
      case 'stats':
        return <Statistics />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <PomodoroTimer />;
    }
  };

  return (
    <PomodoroProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-orange-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">StudyBuddy</h1>
                  <p className="text-xs text-gray-600">Your Pomodoro Companion</p>
                </div>
              </div>
              
              {notificationPermission && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Bell className="w-4 h-4 text-green-500" />
                  <span>Notifications enabled</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white/60 backdrop-blur-md border-b border-orange-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-orange-400 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </PomodoroProvider>
  );
}

export default App;