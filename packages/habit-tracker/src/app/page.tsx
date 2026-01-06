'use client';

import { useEffect, useState } from 'react';

type Habit = {
  id: string;
  name: string;
  streak: number;
  lastChecked: string | null;
  totalChecks: number;
  createdAt: string;
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load habits from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('habits');
    if (stored) {
      setHabits(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      streak: 0,
      lastChecked: null,
      totalChecks: 0,
      createdAt: new Date().toISOString(),
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const checkIn = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== habitId) return habit;
      
      const today = new Date().toDateString();
      const lastChecked = habit.lastChecked ? new Date(habit.lastChecked).toDateString() : null;
      
      // Already checked today
      if (lastChecked === today) return habit;
      
      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = lastChecked === yesterday.toDateString();
      
      return {
        ...habit,
        streak: wasYesterday ? habit.streak + 1 : 1,
        lastChecked: new Date().toISOString(),
        totalChecks: habit.totalChecks + 1,
      };
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const isCheckedToday = (habit: Habit) => {
    if (!habit.lastChecked) return false;
    const today = new Date().toDateString();
    const lastChecked = new Date(habit.lastChecked).toDateString();
    return lastChecked === today;
  };

  const totalStreakDays = habits.reduce((sum, h) => sum + h.streak, 0);
  const totalChecks = habits.reduce((sum, h) => sum + h.totalChecks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            🔥 Habit Tracker
          </h1>
          <p className="text-gray-600">Build streaks, one day at a time</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-indigo-600">{habits.length}</div>
            <div className="text-sm text-gray-600">Habits</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-orange-600">{totalStreakDays}</div>
            <div className="text-sm text-gray-600">Total Streaks</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{totalChecks}</div>
            <div className="text-sm text-gray-600">Check-ins</div>
          </div>
        </div>

        {/* Add Habit */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              placeholder="New habit (e.g., Morning run, Read 30 min)"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
            <button
              onClick={addHabit}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No habits yet. Add your first one above!</p>
            </div>
          ) : (
            habits.map(habit => {
              const checkedToday = isCheckedToday(habit);
              return (
                <div
                  key={habit.id}
                  className={`bg-white rounded-xl p-5 shadow-sm border transition-all ${
                    checkedToday 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          🔥 <strong>{habit.streak}</strong> day streak
                        </span>
                        <span>✓ {habit.totalChecks} total</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => checkIn(habit.id)}
                        disabled={checkedToday}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          checkedToday
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {checkedToday ? '✓ Done' : 'Check In'}
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="px-3 py-3 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete habit"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

