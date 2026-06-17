import React, { useState, useEffect } from 'react';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { Dumbbell, Save, CheckCircle2, Flame, Loader2, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const initialRoutines: Record<string, Task[]> = {
  'Mon': [
    { id: '1', text: 'Bench Press 4x10', completed: false },
    { id: '2', text: 'Incline Dumbbell Press 3x12', completed: false },
    { id: '3', text: 'Tricep Pushdowns 4x15', completed: false },
  ],
  'Tue': [
    { id: '4', text: 'Deadlifts 4x8', completed: false },
    { id: '5', text: 'Pull-ups 3x10', completed: false },
  ],
  'Wed': [
    { id: '6', text: 'Squats 4x12', completed: true },
    { id: '7', text: 'Leg Press 3x10', completed: false },
    { id: '8', text: 'Lunges 3x12', completed: false },
    { id: '9', text: 'Calf Raises 4x20', completed: false },
  ],
  'Thu': [],
  'Fri': [],
  'Sat': [],
  'Sun': [],
};

export default function MemberPlanner() {
  const [activeDay, setActiveDay] = useState('Wed');
  const [routines, setRoutines] = useState<Record<string, Task[]>>(initialRoutines);
  
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [currentTasks, setCurrentTasks] = useState<Task[]>(routines['Wed'] || []);
  const [newTaskText, setNewTaskText] = useState('');
  
  // Update task list when switching days
  useEffect(() => {
    setCurrentTasks(routines[activeDay] || []);
    setNewTaskText('');
  }, [activeDay, routines]);

  const handleToggleTask = (id: string) => {
    setCurrentTasks(prev => 
      prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task)
    );
  };

  const handleDeleteTask = (id: string) => {
    setCurrentTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Math.random().toString(36).substring(7),
      text: newTaskText.trim(),
      completed: false,
    };
    
    setCurrentTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setRoutines(prev => ({ ...prev, [activeDay]: currentTasks }));
      setIsSaving(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }, 600);
  };

  // Determine if there are unsaved changes
  const hasChanges = JSON.stringify(currentTasks) !== JSON.stringify(routines[activeDay] || []);

  return (
    <MemberLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Workout Planner <Flame className="size-6 text-orange-500" />
            </h1>
            <p className="text-muted-foreground mt-1">Plan your routines and drop your workout notes here.</p>
          </div>
        </div>

        {/* Weekly Strip */}
        <div className="glass border-white/5 rounded-2xl p-2 md:p-4">
          <div className="flex justify-between md:justify-center flex-wrap md:gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 md:w-24 py-3 md:py-4 rounded-xl transition-all duration-300 relative group shrink-0",
                  activeDay === day 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="text-sm font-medium mb-1">{day}</span>
                {routines[day] && routines[day].length > 0 && activeDay !== day && (
                  <div className="absolute bottom-2 size-1.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glass border-white/5 h-full min-h-[500px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <Dumbbell className="size-5 text-primary" /> {activeDay}'s Routine
                </CardTitle>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !hasChanges}
                  className={cn(
                    "rounded-xl gap-2 transition-all duration-300",
                    justSaved 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : justSaved ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {justSaved ? 'Saved!' : 'Save Routine'}
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col relative overflow-hidden">
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 z-10">
                  {currentTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
                      <Dumbbell className="size-16" />
                      <p>No exercises planned for {activeDay}.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group cursor-pointer",
                            task.completed 
                              ? "bg-emerald-500/10 border-emerald-500/20" 
                              : "bg-white/5 border-white/10 hover:border-primary/50"
                          )}
                          onClick={() => handleToggleTask(task.id)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* The interactive bubble */}
                            <div className={cn(
                              "size-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 shrink-0",
                              task.completed 
                                ? "bg-emerald-500 border-emerald-500" 
                                : "border-muted-foreground group-hover:border-primary"
                            )}>
                              {task.completed && <Check className="size-4 text-white" />}
                            </div>
                            
                            <span className={cn(
                              "text-base transition-all duration-200",
                              task.completed ? "text-emerald-500 line-through opacity-75" : "text-white"
                            )}>
                              {task.text}
                            </span>
                          </div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Task Form */}
                <div className="p-6 pt-2 border-t border-white/5 bg-background/50 backdrop-blur-sm z-10">
                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <Input 
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add an exercise (e.g., Bench Press 4x10)..."
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                    />
                    <Button type="submit" className="h-12 w-12 rounded-xl shrink-0" disabled={!newTaskText.trim()}>
                      <Plus className="size-5" />
                    </Button>
                  </form>
                </div>
                
                {/* Visual flourishes */}
                <div className="absolute bottom-0 right-0 p-6 pointer-events-none opacity-5">
                  <Dumbbell className="size-32 transform -rotate-12" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips & Stats */}
          <div className="space-y-6">
            
            <Card className="glass border-white/5 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Pro Tip</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Instead of a plain block of text, you can now add each exercise individually. 
                  Tap the circular bubble next to any exercise to cross it off as you complete your workout!
                </p>
              </CardContent>
            </Card>
            <Card className="glass border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">Consistency Tracker</h4>
                    <p className="text-sm text-muted-foreground">You've logged workouts for 4 days this week.</p>
                  </div>
                  <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center rotate-45">
                    <span className="text-xs font-bold text-white -rotate-45">4/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </MemberLayout>
  );
}
