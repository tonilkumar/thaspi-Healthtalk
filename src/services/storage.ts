import {
  ActivityRecord,
  ChatMessage,
  ChatSession,
  Habit,
  HabitRecord,
  JournalEntry,
  MoodEntry,
  MoodType,
  PersonalGoal,
  UserProfile,
} from '../types';
import { COPING_ACTIVITIES } from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'healpath_current_user',
  ALL_USERS: 'healpath_users',
  MOODS: 'healpath_mood_entries',
  CHATS: 'healpath_chat_messages',
  SESSIONS: 'healpath_chat_sessions',
  ACTIVITY_RECORDS: 'healpath_activity_records',
  HABITS: 'healpath_habits',
  HABIT_RECORDS: 'healpath_habit_records',
  JOURNALS: 'healpath_journals',
  GOALS: 'healpath_goals',
  SUPABASE_CONFIG: 'healpath_supabase_config',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}

// Generate unique ID helper
export const uid = () => 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.ensureInitialSeed();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Supabase Configuration
  public getSupabaseConfig(): SupabaseConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return {
      url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
      anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
      connected: false,
    };
  }

  public saveSupabaseConfig(config: SupabaseConfig) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  }

  // Ensure Initial Seed Data
  public ensureInitialSeed() {
    // 1. Seed demo user if no users exist
    const usersRaw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    let demoUserId = 'demo-user-1';

    if (!usersRaw) {
      const demoUser: UserProfile = {
        id: demoUserId,
        name: 'Alex Rivera',
        email: 'alex.student@healpath.edu',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        avatar_color: '#8B5CF6',
        wellness_goal: 'Manage exam anxiety and build healthier bedtime habits',
      };
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify([demoUser]));
      if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
      }
    } else {
      try {
        const users = JSON.parse(usersRaw);
        if (users[0]) demoUserId = users[0].id;
      } catch {
        // ignore
      }
    }

    // 2. Seed Moods if empty
    if (!localStorage.getItem(STORAGE_KEYS.MOODS)) {
      const now = Date.now();
      const pastMoods: MoodEntry[] = [
        {
          id: uid(),
          user_id: demoUserId,
          mood: 'Stressed',
          intensity: 8,
          note: 'Final exam revision for biochemistry was overwhelming today.',
          created_at: new Date(now - 6 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          mood: 'Anxious',
          intensity: 7,
          note: 'Worrying about upcoming presentation.',
          created_at: new Date(now - 5 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          mood: 'Tired',
          intensity: 6,
          note: 'Slept only 5 hours due to late night scrolling.',
          created_at: new Date(now - 4 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          mood: 'Neutral',
          intensity: 5,
          note: 'Balanced day. Finished a small assignment.',
          created_at: new Date(now - 3 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          mood: 'Calm',
          intensity: 8,
          note: 'Tried the 4-7-8 breathing exercise in the campus park.',
          created_at: new Date(now - 2 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          mood: 'Happy',
          intensity: 9,
          note: 'Connected with a close friend over coffee. Feeling supported!',
          created_at: new Date(now - 1 * 86400000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(pastMoods));
    }

    // 3. Seed Habits if empty
    if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
      const initialHabits: Habit[] = [
        {
          id: 'habit-1',
          user_id: demoUserId,
          habit_name: 'Late-night phone doomscrolling',
          trigger: 'Feeling lonely or exhausted in bed before sleep',
          replacement_activity: 'Reading 10 pages of a calming physical book',
          created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        },
        {
          id: 'habit-2',
          user_id: demoUserId,
          habit_name: 'Procrastinating on assignments with short videos',
          trigger: 'Feeling overwhelmed by huge task size',
          replacement_activity: '5-Minute micro-chunk action with zero pressure',
          created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        },
        {
          id: 'habit-3',
          user_id: demoUserId,
          habit_name: 'Stress snacking on sugar during study crunches',
          trigger: 'Afternoon mental slump and tension',
          replacement_activity: 'Herbal chamomile tea + 3 deep sighs',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(initialHabits));

      // Seed habit records for previous dates
      const habitRecords: HabitRecord[] = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        // Habit 1 completed 5 of 7 days
        if (i % 2 === 0 || i === 1) {
          habitRecords.push({
            id: uid(),
            habit_id: 'habit-1',
            completed: true,
            date: dateStr,
          });
        }
        // Habit 2 completed 4 of 7 days
        if (i < 4) {
          habitRecords.push({
            id: uid(),
            habit_id: 'habit-2',
            completed: true,
            date: dateStr,
          });
        }
      }
      localStorage.setItem(STORAGE_KEYS.HABIT_RECORDS, JSON.stringify(habitRecords));
    }

    // 4. Seed Activity Records if empty
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS)) {
      const activityRecords: ActivityRecord[] = [
        {
          id: uid(),
          user_id: demoUserId,
          activity_id: 'act-1',
          completed: true,
          feedback: 'Helpful',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          activity_id: 'act-2',
          completed: true,
          feedback: 'Helpful',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          activity_id: 'act-3',
          completed: true,
          feedback: 'Helpful',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_RECORDS, JSON.stringify(activityRecords));
    }

    // 5. Seed Journals if empty
    if (!localStorage.getItem(STORAGE_KEYS.JOURNALS)) {
      const initialJournals: JournalEntry[] = [
        {
          id: uid(),
          user_id: demoUserId,
          title: 'Letting go of perfectionism in finals week',
          content:
            "I've realized that putting off studying often comes from wanting my notes to be 100% flawless. Today I wrote messy notes for 15 minutes, and it was so liberating. Progress is so much healthier than perfection.",
          mood_tag: 'Calm',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: uid(),
          user_id: demoUserId,
          title: 'Coffee walk and grounding thoughts',
          content:
            'Went for an unhurried 10-minute walk without headphones. Noticed the breeze on the eucalyptus trees and the morning sun on the brick library wall. Feeling more present in my body.',
          mood_tag: 'Happy',
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(initialJournals));
    }

    // 6. Seed Goals if empty
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      const initialGoals: PersonalGoal[] = [
        {
          id: uid(),
          user_id: demoUserId,
          title: 'Practice 4-7-8 breathing before bed 5 nights a week',
          completed: false,
        },
        {
          id: uid(),
          user_id: demoUserId,
          title: 'Swap first 15 mins of morning phone time with stretching',
          completed: true,
        },
        {
          id: uid(),
          user_id: demoUserId,
          title: 'Reach out to one friend when feeling isolated',
          completed: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(initialGoals));
    }

    // 7. Seed Initial Welcome Chat Message if empty
    if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
      const initialChats: ChatMessage[] = [
        {
          id: uid(),
          session_id: 'default-session',
          sender: 'ai',
          message:
            "Hi Alex! I'm TalkSpace, your gentle wellness companion. Whether you're navigating academic deadlines, spiraling thoughts, or just need a safe space to vent, I'm right here with you. How is your heart feeling right now?",
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(initialChats));
    }
  }

  // --- Auth / User Profiles ---
  public getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      // update in users list too
      const users = this.getAllUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  public getAllUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public registerUser(name: string, email: string, wellness_goal?: string): UserProfile {
    const newUser: UserProfile = {
      id: uid(),
      name,
      email,
      created_at: new Date().toISOString(),
      avatar_color: '#8B5CF6',
      wellness_goal: wellness_goal || 'Build emotional resilience and balance',
    };
    const users = this.getAllUsers();
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  // --- Moods ---
  public getMoodEntries(userId: string): MoodEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOODS);
    if (!raw) return [];
    try {
      const all: MoodEntry[] = JSON.parse(raw);
      return all
        .filter((m) => m.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }

  public addMoodEntry(userId: string, mood: MoodType, intensity: number, note?: string): MoodEntry {
    const entry: MoodEntry = {
      id: uid(),
      user_id: userId,
      mood,
      intensity,
      note: note?.trim(),
      created_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(STORAGE_KEYS.MOODS);
    const list: MoodEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(list));
    return entry;
  }

  // --- Chat Messages ---
  public getChatMessages(sessionId: string = 'default-session'): ChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (!raw) return [];
    try {
      const list: ChatMessage[] = JSON.parse(raw);
      return list.filter((m) => m.session_id === sessionId);
    } catch {
      return [];
    }
  }

  public addChatMessage(
    sender: 'user' | 'ai',
    message: string,
    sessionId: string = 'default-session',
    suggested_activity?: string,
    suggested_category?: string,
    suggested_activity_id?: string
  ): ChatMessage {
    const entry: ChatMessage = {
      id: uid(),
      session_id: sessionId,
      sender,
      message,
      created_at: new Date().toISOString(),
      suggested_activity,
      suggested_category,
      suggested_activity_id,
    };
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(list));
    return entry;
  }

  public clearChat(sessionId: string = 'default-session') {
    const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (!raw) return;
    try {
      const list: ChatMessage[] = JSON.parse(raw);
      const remaining = list.filter((m) => m.session_id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(remaining));
    } catch {
      // ignore
    }
  }

  // --- Coping Activities & Activity Records ---
  public getCopingActivities() {
    return COPING_ACTIVITIES;
  }

  public getActivityRecords(userId: string): ActivityRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS);
    if (!raw) return [];
    try {
      const all: ActivityRecord[] = JSON.parse(raw);
      return all.filter((r) => r.user_id === userId);
    } catch {
      return [];
    }
  }

  public recordActivityCompletion(
    userId: string,
    activityId: string,
    feedback?: 'Helpful' | 'Not Helpful'
  ): ActivityRecord {
    const record: ActivityRecord = {
      id: uid(),
      user_id: userId,
      activity_id: activityId,
      completed: true,
      feedback,
      created_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS);
    const list: ActivityRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_RECORDS, JSON.stringify(list));
    return record;
  }

  // --- Habits & Habit Records ---
  public getHabits(userId: string): Habit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return [];
    try {
      const all: Habit[] = JSON.parse(raw);
      return all.filter((h) => h.user_id === userId);
    } catch {
      return [];
    }
  }

  public addHabit(userId: string, habitName: string, trigger: string, replacement: string): Habit {
    const habit: Habit = {
      id: uid(),
      user_id: userId,
      habit_name: habitName.trim(),
      trigger: trigger.trim(),
      replacement_activity: replacement.trim(),
      created_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    const list: Habit[] = raw ? JSON.parse(raw) : [];
    list.push(habit);
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(list));
    return habit;
  }

  public deleteHabit(habitId: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return;
    try {
      const all: Habit[] = JSON.parse(raw);
      const filtered = all.filter((h) => h.id !== habitId);
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(filtered));

      // also remove records
      const recordsRaw = localStorage.getItem(STORAGE_KEYS.HABIT_RECORDS);
      if (recordsRaw) {
        const records: HabitRecord[] = JSON.parse(recordsRaw);
        localStorage.setItem(
          STORAGE_KEYS.HABIT_RECORDS,
          JSON.stringify(records.filter((r) => r.habit_id !== habitId))
        );
      }
    } catch {
      // ignore
    }
  }

  public getHabitRecords(): HabitRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HABIT_RECORDS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public toggleHabitRecord(habitId: string, date: string): boolean {
    const records = this.getHabitRecords();
    const existingIndex = records.findIndex((r) => r.habit_id === habitId && r.date === date);

    if (existingIndex >= 0) {
      // Toggle off or remove
      records.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEYS.HABIT_RECORDS, JSON.stringify(records));
      return false;
    } else {
      // Mark completed
      records.push({
        id: uid(),
        habit_id: habitId,
        completed: true,
        date,
      });
      localStorage.setItem(STORAGE_KEYS.HABIT_RECORDS, JSON.stringify(records));
      return true;
    }
  }

  // --- Journals ---
  public getJournals(userId: string): JournalEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    if (!raw) return [];
    try {
      const all: JournalEntry[] = JSON.parse(raw);
      return all
        .filter((j) => j.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  }

  public addJournalEntry(userId: string, title: string, content: string, moodTag?: MoodType): JournalEntry {
    const entry: JournalEntry = {
      id: uid(),
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      mood_tag: moodTag,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    const list: JournalEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(list));
    return entry;
  }

  public updateJournalEntry(id: string, title: string, content: string, moodTag?: MoodType): JournalEntry | null {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    if (!raw) return null;
    try {
      const list: JournalEntry[] = JSON.parse(raw);
      const idx = list.findIndex((j) => j.id === id);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          title: title.trim(),
          content: content.trim(),
          mood_tag: moodTag,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(list));
        return list[idx];
      }
    } catch {
      // ignore
    }
    return null;
  }

  public deleteJournalEntry(id: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    if (!raw) return;
    try {
      const list: JournalEntry[] = JSON.parse(raw);
      const filtered = list.filter((j) => j.id !== id);
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  // --- Personal Goals ---
  public getGoals(userId: string): PersonalGoal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return [];
    try {
      const all: PersonalGoal[] = JSON.parse(raw);
      return all.filter((g) => g.user_id === userId);
    } catch {
      return [];
    }
  }

  public addGoal(userId: string, title: string): PersonalGoal {
    const goal: PersonalGoal = {
      id: uid(),
      user_id: userId,
      title: title.trim(),
      completed: false,
    };
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    const list: PersonalGoal[] = raw ? JSON.parse(raw) : [];
    list.push(goal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
    return goal;
  }

  public toggleGoal(id: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return false;
    try {
      const list: PersonalGoal[] = JSON.parse(raw);
      const item = list.find((g) => g.id === id);
      if (item) {
        item.completed = !item.completed;
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list));
        return item.completed;
      }
    } catch {
      // ignore
    }
    return false;
  }

  public deleteGoal(id: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return;
    try {
      const list: PersonalGoal[] = JSON.parse(raw);
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list.filter((g) => g.id !== id)));
    } catch {
      // ignore
    }
  }

  // Reset all user data to fresh initial seed
  public resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.MOODS);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.HABIT_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.JOURNALS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    this.ensureInitialSeed();
  }
}

export const storage = StorageService.getInstance();
