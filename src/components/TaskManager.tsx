import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, Circle, Trash2, Edit3, Save, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  estimatedSessions: number;
  completedSessions: number;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    estimatedSessions: 1,
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('studyBuddyTasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        })));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studyBuddyTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        completed: false,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        createdAt: new Date(),
        estimatedSessions: newTask.estimatedSessions,
        completedSessions: 0,
      };
      
      setTasks([task, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedSessions: 1,
      });
      setIsCreating(false);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates }
        : task
    ));
    setEditingId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (date: Date) => {
    return date < new Date() && date.toDateString() !== new Date().toDateString();
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      estimatedSessions: task.estimatedSessions,
    });

    const handleSave = () => {
      handleUpdateTask(task.id, {
        title: editData.title,
        description: editData.description,
        priority: editData.priority,
        dueDate: editData.dueDate ? new Date(editData.dueDate) : undefined,
        estimatedSessions: editData.estimatedSessions,
      });
      setIsEditing(false);
    };

    return (
      <div className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow ${
        task.completed ? 'opacity-75' : ''
      }`}>
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full text-lg font-semibold bg-transparent border-b-2 border-gray-200 focus:border-orange-400 outline-none pb-2"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full h-20 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none resize-none"
              placeholder="Task description..."
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="number"
                value={editData.estimatedSessions}
                onChange={(e) => setEditData({ ...editData, estimatedSessions: parseInt(e.target.value) })}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none"
                min="1"
                placeholder="Sessions"
              />
            </div>
            <input
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
              className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="flex-shrink-0 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 hover:text-orange-500" />
                  )}
                </button>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    getPriorityColor(task.priority)
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {task.description && (
              <p className={`text-gray-700 mb-3 ${
                task.completed ? 'line-through' : ''
              }`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {task.dueDate && (
                  <div className={`flex items-center space-x-1 ${
                    isOverdue(task.dueDate) ? 'text-red-600' : ''
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{task.completedSessions}/{task.estimatedSessions} sessions</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-600">Organize your study goals and track progress</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        {['all', 'pending', 'completed'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Create Task Form */}
      {isCreating && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full text-lg font-semibold bg-transparent border-b-2 border-gray-200 focus:border-orange-400 outline-none pb-2"
              placeholder="Task title..."
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full h-20 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none resize-none"
              placeholder="Task description..."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="number"
                value={newTask.estimatedSessions}
                onChange={(e) => setNewTask({ ...newTask, estimatedSessions: parseInt(e.target.value) })}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none"
                min="1"
                placeholder="Estimated sessions"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-orange-400 outline-none"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateTask}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Create Task</span>
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTask({
                    title: '',
                    description: '',
                    priority: 'medium',
                    dueDate: '',
                    estimatedSessions: 1,
                  });
                }}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
          <p className="text-gray-500">Create your first task to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskManager;