'use client';

import { useEffect, useState } from 'react';

interface Habit {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  completions: { [date: string]: boolean };
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Load habits from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('habits');
    if (stored) {
      setHabits(JSON.parse(stored));
    }
    const darkModeStored = localStorage.getItem('darkMode');
    if (darkModeStored) {
      setDarkMode(JSON.parse(darkModeStored));
    }
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      description: newHabitDescription,
      createdAt: getTodayString(),
      completions: {}
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitDescription('');
    setShowAddModal(false);
  };

  const updateHabit = () => {
    if (!editingHabit || !newHabitName.trim()) return;
    
    setHabits(habits.map(h => 
      h.id === editingHabit.id 
        ? { ...h, name: newHabitName, description: newHabitDescription }
        : h
    ));
    
    setEditingHabit(null);
    setNewHabitName('');
    setNewHabitDescription('');
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        newCompletions[date] = !newCompletions[date];
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const calculateStreak = (habit: Habit): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      if (habit.completions[dateString]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateCompletionRate = (habit: Habit): number => {
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    const completedDays = Object.values(habit.completions).filter(Boolean).length;
    return Math.round((completedDays / daysSinceCreation) * 100);
  };

  const calculateWeeklyProgress = (habit: Habit): number => {
    let completed = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      if (habit.completions[dateString]) {
        completed++;
      }
    }
    
    return Math.round((completed / 7) * 100);
  };

  const calculateMonthlyProgress = (habit: Habit): number => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let completed = 0;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      
      if (habit.completions[dateString]) {
        completed++;
      }
    }
    
    return Math.round((completed / daysInMonth) * 100);
  };

  const calculateHabitScore = (habit: Habit): number => {
    const streak = calculateStreak(habit);
    const completionRate = calculateCompletionRate(habit);
    return Math.round((0.4 * streak) + (0.6 * completionRate));
  };

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setNewHabitDescription(habit.description);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingHabit(null);
    setNewHabitName('');
    setNewHabitDescription('');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Habit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No habits yet. Create your first habit to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {habits.map(habit => {
              const streak = calculateStreak(habit);
              const completionRate = calculateCompletionRate(habit);
              const weeklyProgress = calculateWeeklyProgress(habit);
              const monthlyProgress = calculateMonthlyProgress(habit);
              const habitScore = calculateHabitScore(habit);
              const last7Days = getLast7Days();
              const isCompletedToday = habit.completions[getTodayString()];

              return (
                <div
                  key={habit.id}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}
                >
                  {/* Habit Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{habit.name}</h3>
                      {habit.description && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {habit.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(habit)}
                        className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                        aria-label="Edit habit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className={`text-sm ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}
                        aria-label="Delete habit"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Today's Completion */}
                  <button
                    onClick={() => toggleCompletion(habit.id, getTodayString())}
                    className={`w-full py-3 rounded-lg font-medium mb-4 ${
                      isCompletedToday
                        ? 'bg-green-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isCompletedToday ? '✓ Completed Today' : 'Mark as Complete'}
                  </button>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>🔥 Streak</span>
                        <span className="font-semibold">{streak} days</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall</span>
                        <span className="font-semibold">{completionRate}%</span>
                      </div>
                      <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(completionRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly</span>
                        <span className="font-semibold">{weeklyProgress}%</span>
                      </div>
                      <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${weeklyProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly</span>
                        <span className="font-semibold">{monthlyProgress}%</span>
                      </div>
                      <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${monthlyProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span>⭐ Habit Score</span>
                        <span className="font-semibold">{habitScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last 7 Days */}
                  <div>
                    <p className="text-sm font-medium mb-2">Last 7 Days</p>
                    <div className="flex gap-1">
                      {last7Days.map(day => (
                        <button
                          key={day.date}
                          onClick={() => toggleCompletion(habit.id, day.date)}
                          className={`flex-1 aspect-square rounded flex flex-col items-center justify-center text-xs ${
                            habit.completions[day.date]
                              ? 'bg-green-600 text-white'
                              : darkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                          title={day.date}
                        >
                          <span>{day.label}</span>
                          {habit.completions[day.date] && <span className="text-lg">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || editingHabit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
            <h2 className="text-2xl font-bold mb-4">
              {editingHabit ? 'Edit Habit' : 'Add New Habit'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Exercise, Read, Meditate"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Add details about your habit..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={editingHabit ? updateHabit : addHabit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingHabit ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={closeModal}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

