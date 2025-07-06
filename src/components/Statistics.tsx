import React from 'react';
import { TrendingUp, Target, Clock, Calendar, Award, Zap, Tag } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';

const Statistics: React.FC = () => {
  const { state } = usePomodoro();

  const getWeeklyData = () => {
    // Mock data for the week - in a real app, this would come from stored data
    return [
      { day: 'Mon', sessions: 8, time: 200 },
      { day: 'Tue', sessions: 6, time: 150 },
      { day: 'Wed', sessions: 10, time: 250 },
      { day: 'Thu', sessions: 5, time: 125 },
      { day: 'Fri', sessions: 7, time: 175 },
      { day: 'Sat', sessions: 4, time: 100 },
      { day: 'Sun', sessions: 3, time: 75 },
    ];
  };

  const getTagStatistics = () => {
    const tagStats = new Map();
    
    state.sessionHistory.forEach(session => {
      if (session.type === 'work' && session.tag) {
        const current = tagStats.get(session.tag.id) || { 
          tag: session.tag, 
          sessions: 0, 
          totalTime: 0 
        };
        current.sessions += 1;
        current.totalTime += session.duration;
        tagStats.set(session.tag.id, current);
      }
    });
    
    return Array.from(tagStats.values()).sort((a, b) => b.sessions - a.sessions);
  };

  const getRecentSessions = () => {
    return state.sessionHistory
      .filter(session => session.type === 'work')
      .slice(0, 10);
  };

  const weeklyData = getWeeklyData();
  const maxSessions = Math.max(...weeklyData.map(d => d.sessions));
  const totalWeeklyTime = weeklyData.reduce((sum, d) => sum + d.time, 0);
  const avgSessionLength = state.totalSessions > 0 ? Math.round(state.statistics.totalTime / state.totalSessions) : 0;
  const tagStats = getTagStatistics();
  const recentSessions = getRecentSessions();

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }> = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{title}</div>
        </div>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Productivity Statistics</h1>
        <p className="text-gray-600">Track your progress and maintain your momentum</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Target className="w-6 h-6 text-white" />}
          title="Today's Sessions"
          value={state.statistics.dailySessions}
          subtitle="Keep it up!"
          color="bg-gradient-to-br from-orange-400 to-red-400"
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-white" />}
          title="Current Streak"
          value={`${state.statistics.streak} days`}
          subtitle="Your best yet!"
          color="bg-gradient-to-br from-green-400 to-teal-400"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-white" />}
          title="Total Time"
          value={`${Math.floor(state.statistics.totalTime / 60)}h ${state.statistics.totalTime % 60}m`}
          subtitle="Time well spent"
          color="bg-gradient-to-br from-purple-400 to-indigo-400"
        />
        <StatCard
          icon={<Award className="w-6 h-6 text-white" />}
          title="Total Sessions"
          value={state.totalSessions}
          subtitle="Sessions completed"
          color="bg-gradient-to-br from-blue-400 to-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Weekly Progress</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span>Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Time (min)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-700">{day.day}</div>
                </div>
                <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Sessions bar */}
                  <div
                    className="absolute bottom-0 left-0 w-1/2 bg-orange-400 rounded-tl-lg transition-all duration-500"
                    style={{
                      height: `${(day.sessions / maxSessions) * 100}%`,
                    }}
                  />
                  {/* Time bar */}
                  <div
                    className="absolute bottom-0 right-0 w-1/2 bg-blue-400 rounded-tr-lg transition-all duration-500"
                    style={{
                      height: `${(day.time / 300) * 100}%`, // Assuming 300 min is max
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div>{day.sessions} sessions</div>
                  <div>{day.time} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tag Statistics */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Session Tags</h3>
          {tagStats.length > 0 ? (
            <div className="space-y-4">
              {tagStats.map((stat, index) => (
                <div key={stat.tag.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${stat.tag.color}`}></div>
                    <span className="font-medium text-gray-900">{stat.tag.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {stat.sessions} sessions
                    </div>
                    <div className="text-xs text-gray-600">
                      {Math.floor(stat.totalTime / 60)}h {stat.totalTime % 60}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tagged sessions yet</p>
              <p className="text-sm text-gray-400">Start tagging your focus sessions to see statistics</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detailed Stats */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Session Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Session Length</span>
              <span className="font-semibold">{avgSessionLength} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-semibold">{state.statistics.streak} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold">{state.statistics.weeklySessions} sessions</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weekly Time</span>
              <span className="font-semibold">{Math.floor(totalWeeklyTime / 60)}h {totalWeeklyTime % 60}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tags Used</span>
              <span className="font-semibold">{tagStats.length}</span>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sessions</h3>
          {recentSessions.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {session.tag ? (
                      <div className={`w-3 h-3 rounded-full ${session.tag.color}`}></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.tag?.name || 'Untagged'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(session.completedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {session.duration} min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sessions completed yet</p>
              <p className="text-sm text-gray-400">Complete your first focus session to see it here</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">First Timer</div>
                <div className="text-sm text-gray-600">Complete your first session</div>
              </div>
            </div>
            
            {state.statistics.streak >= 3 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Streak Master</div>
                  <div className="text-sm text-gray-600">Maintain a 3-day streak</div>
                </div>
              </div>
            )}
            
            {state.totalSessions >= 10 && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dedicated Learner</div>
                  <div className="text-sm text-gray-600">Complete 10 sessions</div>
                </div>
              </div>
            )}
            
            {state.statistics.totalTime >= 300 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Time Master</div>
                  <div className="text-sm text-gray-600">Study for 5+ hours total</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;