export type MoodType =
  | 'Happy'
  | 'Calm'
  | 'Neutral'
  | 'Sad'
  | 'Anxious'
  | 'Stressed'
  | 'Lonely'
  | 'Tired';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  avatar_color?: string;
  wellness_goal?: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  intensity: number; // 1 - 10
  note?: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
  suggested_activity?: string;
  suggested_category?: string;
  suggested_activity_id?: string;
}

export interface CopingActivity {
  id: string;
  title: string;
  category: 'Stress' | 'Overthinking' | 'Loneliness' | 'Low motivation' | 'Academic pressure' | 'Excessive scrolling' | 'General';
  description: string;
  duration: string; // e.g., '4 mins', '5 mins'
  steps: string[];
  type: 'breathing' | 'grounding' | 'timer' | 'journal' | 'microsteps' | 'habit_swap' | 'mindful';
  icon: string;
}

export interface ActivityRecord {
  id: string;
  user_id: string;
  activity_id: string;
  completed: boolean;
  feedback?: 'Helpful' | 'Not Helpful';
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  habit_name: string; // Unwanted habit
  trigger: string;    // Trigger
  replacement_activity: string; // Healthier replacement
  created_at: string;
}

export interface HabitRecord {
  id: string;
  habit_id: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_tag?: MoodType;
  created_at: string;
  updated_at: string;
}

export interface PersonalGoal {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  target_date?: string;
}

export type NavigationTab = 'home' | 'talk' | 'cope' | 'growth' | 'profile';
