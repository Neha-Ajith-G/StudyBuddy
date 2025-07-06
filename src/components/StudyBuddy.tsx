import React from 'react';

interface StudyBuddyProps {
  isActive: boolean;
  session: 'work' | 'shortBreak' | 'longBreak';
  progress: number;
}

const StudyBuddy: React.FC<StudyBuddyProps> = ({ isActive, session, progress }) => {
  const getAnimationClass = () => {
    if (!isActive) return 'animate-pulse';
    
    switch (session) {
      case 'work':
        return 'animate-bounce';
      case 'shortBreak':
        return 'animate-pulse';
      case 'longBreak':
        return 'animate-pulse';
      default:
        return 'animate-pulse';
    }
  };

  const getBuddyExpression = () => {
    if (!isActive) return '😴';
    
    if (progress < 25) return '😊';
    if (progress < 50) return '🤔';
    if (progress < 75) return '😤';
    return '🔥';
  };

  const getActivityText = () => {
    if (!isActive) return "I'm ready when you are!";
    
    switch (session) {
      case 'work':
        if (progress < 25) return "Let's focus together!";
        if (progress < 50) return "We're making great progress!";
        if (progress < 75) return "Keep going, we're almost there!";
        return "Final push! You've got this!";
      case 'shortBreak':
        return "Time for a quick break! 🌸";
      case 'longBreak':
        return "Great job! Enjoy your long break! 🎉";
      default:
        return "Let's get started!";
    }
  };

  const getBackgroundColor = () => {
    switch (session) {
      case 'work':
        return 'from-orange-100 to-red-100';
      case 'shortBreak':
        return 'from-green-100 to-teal-100';
      case 'longBreak':
        return 'from-purple-100 to-indigo-100';
      default:
        return 'from-orange-100 to-red-100';
    }
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getBackgroundColor()} rounded-2xl p-8`}>
      {/* Study Buddy Character */}
      <div className="relative mb-8">
        <div className={`text-8xl ${getAnimationClass()} select-none`}>
          {getBuddyExpression()}
        </div>
        
        {/* Books and Study Items */}
        <div className="absolute -bottom-2 -left-4 text-2xl animate-pulse">
          📚
        </div>
        <div className="absolute -bottom-2 -right-4 text-2xl animate-pulse delay-300">
          ✏️
        </div>
        
        {/* Progress Indicator */}
        {isActive && (
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
              <div className="text-xs font-bold text-gray-700">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Text */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Study Buddy
        </h3>
        <p className="text-gray-600 text-lg font-medium">
          {getActivityText()}
        </p>
      </div>

      {/* Motivational Elements */}
      {isActive && session === 'work' && (
        <div className="mt-4 flex space-x-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
        </div>
      )}

      {/* Break Elements */}
      {isActive && session !== 'work' && (
        <div className="mt-4 text-2xl animate-pulse">
          {session === 'shortBreak' ? '☕' : '🧘‍♀️'}
        </div>
      )}
    </div>
  );
};

export default StudyBuddy;