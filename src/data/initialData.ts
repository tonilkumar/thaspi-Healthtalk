import { CopingActivity, MoodType } from '../types';

export const MOOD_CONFIG: Record<
  MoodType,
  { emoji: string; label: string; color: string; bg: string; border: string; text: string; description: string }
> = {
  Happy: {
    emoji: '✨',
    label: 'Happy',
    color: '#F59E0B',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    description: 'Feeling positive, energetic, or joyful',
  },
  Calm: {
    emoji: '🌿',
    label: 'Calm',
    color: '#10B981',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    description: 'At ease, grounded, and peaceful',
  },
  Neutral: {
    emoji: '☁️',
    label: 'Neutral',
    color: '#64748B',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    description: 'Steady, ordinary, in-between',
  },
  Sad: {
    emoji: '🌧️',
    label: 'Sad',
    color: '#3B82F6',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    description: 'Low spirits, heavy, or down',
  },
  Anxious: {
    emoji: '⚡',
    label: 'Anxious',
    color: '#F97316',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    description: 'Nervous, restless, or on edge',
  },
  Stressed: {
    emoji: '🌪️',
    label: 'Stressed',
    color: '#EF4444',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    description: 'Overloaded, tense, or overwhelmed',
  },
  Lonely: {
    emoji: '🌙',
    label: 'Lonely',
    color: '#8B5CF6',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    description: 'Disconnected, isolated, seeking warmth',
  },
  Tired: {
    emoji: '💤',
    label: 'Tired',
    color: '#6366F1',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    description: 'Exhausted, low battery, needing rest',
  },
};

export const COPING_ACTIVITIES: CopingActivity[] = [
  {
    id: 'act-1',
    title: 'Box Breathing (4-4-4-4)',
    category: 'Stress',
    description: 'Reset your nervous system with rhythmic diaphragmatic breathing.',
    duration: '4 mins',
    type: 'breathing',
    icon: 'Wind',
    steps: [
      'Find a comfortable posture with your spine straight and shoulders relaxed.',
      'Inhale slowly through your nose for 4 counts.',
      'Gently hold your breath at the top for 4 counts.',
      'Exhale smoothly through your mouth for 4 counts.',
      'Hold empty lungs at the bottom for 4 counts before repeating.',
    ],
  },
  {
    id: 'act-2',
    title: '5-4-3-2-1 Sensory Grounding',
    category: 'Overthinking',
    description: 'Pull your mind out of spiraling thoughts back into the tangible present.',
    duration: '5 mins',
    type: 'grounding',
    icon: 'Compass',
    steps: [
      'Name 5 things you can SEE around you right now.',
      'Notice 4 things you can physically TOUCH or feel.',
      'Identify 3 things you can HEAR in the room or distance.',
      'Notice 2 things you can SMELL right now.',
      'Identify 1 thing you can TASTE or an affirmation you believe.',
    ],
  },
  {
    id: 'act-3',
    title: 'Five-Minute Action Rule',
    category: 'Low motivation',
    description: 'Overcome paralysis by committing to do just 5 minutes without pressure to continue.',
    duration: '5 mins',
    type: 'timer',
    icon: 'Zap',
    steps: [
      'Pick the one task you are dreading or putting off.',
      'Strip away the goal of finishing it—only commit to touching it for 5 minutes.',
      'Set the 5-minute timer below and start immediately.',
      'When the bell chimes, you have full permission to stop or keep going if momentum kicked in.',
    ],
  },
  {
    id: 'act-4',
    title: 'Micro-Step Task Breakdown',
    category: 'Academic pressure',
    description: 'Deconstruct intimidating assignments or study blocks into bite-sized chips.',
    duration: '8 mins',
    type: 'microsteps',
    icon: 'ListChecks',
    steps: [
      'Write down the intimidating academic milestone (e.g., "Term Paper Draft").',
      'Split it into 3 microscopic steps that take under 10 minutes each.',
      'Number them: Step 1 (Open doc & type title), Step 2 (Write 3 bullet points), Step 3 (Write 50 words).',
      'Focus strictly on Step 1 right now.',
    ],
  },
  {
    id: 'act-5',
    title: 'Mindful Swap & Digital Unplug',
    category: 'Excessive scrolling',
    description: 'Interrupt automatic doomscrolling loops with a physical dopamine substitute.',
    duration: '10 mins',
    type: 'habit_swap',
    icon: 'SmartphoneOff',
    steps: [
      'Place your phone face down or in another room right now.',
      'Drink a glass of cold water slowly and feel the temperature.',
      'Pick up a physical book, notebook, or look out of a window for 10 minutes.',
      'Acknowledge any itch to check notifications without acting on it.',
    ],
  },
  {
    id: 'act-6',
    title: 'Caring Connection Bridge',
    category: 'Loneliness',
    description: 'Rebuild human warmth by sending a zero-pressure message to someone you value.',
    duration: '3 mins',
    type: 'mindful',
    icon: 'HeartHandshake',
    steps: [
      'Think of one friend, classmate, mentor, or family member.',
      'Draft a simple message: "Thinking of you today! Hope you are having a peaceful week."',
      'Send it without expecting an immediate reply.',
      'Notice the subtle shift in your heart as you spread kindness.',
    ],
  },
  {
    id: 'act-7',
    title: 'Mindful Body & Jaw Release',
    category: 'Stress',
    description: 'Release unconscious physical tension stored in your temples, neck, and shoulders.',
    duration: '4 mins',
    type: 'mindful',
    icon: 'Activity',
    steps: [
      'Drop your shoulders down away from your ears.',
      'Unclench your jaw and rest your tongue gently away from the roof of your mouth.',
      'Soften the muscles around your eyes and forehead.',
      'Take 3 deep, audible sighs of relief.',
    ],
  },
  {
    id: 'act-8',
    title: 'Evening Reflection & Thought Release',
    category: 'Overthinking',
    description: 'Clear spinning thoughts before sleep onto a safe digital page.',
    duration: '6 mins',
    type: 'journal',
    icon: 'BookOpen',
    steps: [
      'What occupied most of your mental energy today?',
      'What is one thing that went better than expected?',
      'What can you safely let go of until tomorrow morning?',
    ],
  },
];

export const PRESET_HABIT_INSPIRATIONS = [
  {
    habit_name: 'Doomscrolling in bed before sleep',
    trigger: 'Feeling tired but unable to switch off my mind',
    replacement_activity: 'Reading 10 pages of a physical book or fiction',
  },
  {
    habit_name: 'Binge eating junk food while studying',
    trigger: 'Academic stress and mental fatigue during exam prep',
    replacement_activity: 'Brewing a warm cup of herbal chamomile tea & 5 deep breaths',
  },
  {
    habit_name: 'Procrastinating on assignments by watching reels',
    trigger: 'Fear of starting an overwhelming paper or project',
    replacement_activity: 'Doing just 5 minutes of brainstorming outline on paper',
  },
  {
    habit_name: 'Comparing myself to others on social media',
    trigger: 'Boredom or feeling inadequate when checking Instagram',
    replacement_activity: 'Writing down 3 genuine things I appreciate about my journey',
  },
];

export const STUDENT_HELPLINES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    contact: 'Call or Text 988',
    detail: '24/7 free, confidential support for people in distress',
  },
  {
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    detail: 'Free 24/7 text line connect with a crisis counselor',
  },
  {
    name: 'The Trevor Project (LGBTQ Youth)',
    contact: 'Call 1-866-488-7386 or Text START to 678-678',
    detail: 'Confidential suicide prevention & crisis intervention',
  },
  {
    name: 'Campus Counseling & Health Services',
    contact: 'Check student portal / directory',
    detail: 'Confidential on-campus sessions and academic accommodations',
  },
];

export const SUPABASE_SQL_SCHEMA = `-- HealPath PostgreSQL Database Schema for Supabase
-- Core concept: UNDERSTAND -> COPE -> HEAL -> GROW

-- 1. Profiles Table (Synced with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  wellness_goal TEXT DEFAULT 'Build mental resilience and balance',
  avatar_color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mood Entries
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  intensity INT CHECK (intensity >= 1 AND intensity <= 10),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coping Activities (Catalog)
CREATE TABLE IF NOT EXISTS public.coping_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL
);

-- 6. Activity Records (User completion & feedback)
CREATE TABLE IF NOT EXISTS public.activity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL REFERENCES public.coping_activities(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT TRUE,
  feedback TEXT CHECK (feedback IN ('Helpful', 'Not Helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Habits (Replacement framework: Replace, Don't Just Remove)
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  replacement_activity TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Habit Records (Daily completions)
CREATE TABLE IF NOT EXISTS public.habit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT TRUE,
  date DATE NOT NULL,
  UNIQUE(habit_id, date)
);

-- 9. Journal Entries (Private personal reflections)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies so users only access their own records
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own mood entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own activity records" ON public.activity_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own journal entries" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);
`;
