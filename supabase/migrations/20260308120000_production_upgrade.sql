-- =============================================================================
-- NoteAura Production Upgrade Migration
-- Adds all tables for Phases 1-4 of the upgrade roadmap
-- =============================================================================

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- PHASE 1: Document Pages (PDF text extraction pipeline)
-- =============================================================================
CREATE TABLE public.document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document pages" ON public.document_pages
  FOR SELECT USING (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own document pages" ON public.document_pages
  FOR INSERT WITH CHECK (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE INDEX idx_document_pages_document_id ON public.document_pages(document_id);
CREATE UNIQUE INDEX idx_document_pages_unique ON public.document_pages(document_id, page_number);

-- =============================================================================
-- PHASE 2: Subscriptions (Stripe integration)
-- =============================================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'university')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- PHASE 2: Usage Tracking
-- =============================================================================
CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_usage_tracking_user_period ON public.usage_tracking(user_id, period_start, period_end);
CREATE UNIQUE INDEX idx_usage_tracking_unique ON public.usage_tracking(user_id, feature, period_start);

-- =============================================================================
-- PHASE 2: Folders (Document organization)
-- =============================================================================
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Add folder_id to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- =============================================================================
-- PHASE 2: Document Tags
-- =============================================================================
CREATE TABLE public.document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1'
);

ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" ON public.document_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.document_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.document_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.document_tags
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.document_tag_links (
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.document_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

ALTER TABLE public.document_tag_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tag links" ON public.document_tag_links
  FOR SELECT USING (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own tag links" ON public.document_tag_links
  FOR INSERT WITH CHECK (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own tag links" ON public.document_tag_links
  FOR DELETE USING (
    document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid())
  );

-- =============================================================================
-- PHASE 3: Weakness Profiles (AI Weakness Radar)
-- =============================================================================
CREATE TABLE public.weakness_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subtopic TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  times_tested INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.weakness_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weakness profiles" ON public.weakness_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weakness profiles" ON public.weakness_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weakness profiles" ON public.weakness_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.micro_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weakness_id UUID REFERENCES public.weakness_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  lesson_type TEXT CHECK (lesson_type IN ('explanation', 'example', 'practice', 'mnemonic')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.micro_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own micro lessons" ON public.micro_lessons
  FOR SELECT USING (
    weakness_id IN (SELECT id FROM public.weakness_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own micro lessons" ON public.micro_lessons
  FOR UPDATE USING (
    weakness_id IN (SELECT id FROM public.weakness_profiles WHERE user_id = auth.uid())
  );

-- =============================================================================
-- PHASE 3: Score Predictions (Predictive Score Engine)
-- =============================================================================
CREATE TABLE public.score_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  predicted_min DECIMAL(5,2),
  predicted_max DECIMAL(5,2),
  confidence DECIMAL(3,2),
  factors JSONB,
  actual_score DECIMAL(5,2),
  predicted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.score_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions" ON public.score_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON public.score_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" ON public.score_predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- PHASE 3: Battle Rooms (Real-Time Exam Battles)
-- =============================================================================
CREATE TABLE public.battle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'abandoned')),
  mode TEXT DEFAULT 'speed' CHECK (mode IN ('speed', 'endurance', 'sudden_death')),
  questions JSONB,
  host_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own battles" ON public.battle_rooms
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can insert battles" ON public.battle_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update own battles" ON public.battle_rooms
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = opponent_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_rooms;

CREATE TABLE public.elo_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rating INTEGER DEFAULT 1200,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.elo_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all elo ratings" ON public.elo_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own elo" ON public.elo_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own elo" ON public.elo_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- PHASE 3: Concepts & Relationships (Knowledge Graph)
-- =============================================================================
CREATE TABLE public.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  definition TEXT,
  category TEXT,
  importance_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own concepts" ON public.concepts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own concepts" ON public.concepts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own concepts" ON public.concepts
  FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.concept_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_a UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
  concept_b UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT,
  strength DECIMAL(3,2) DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.concept_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own concept relationships" ON public.concept_relationships
  FOR SELECT USING (
    concept_a IN (SELECT id FROM public.concepts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own concept relationships" ON public.concept_relationships
  FOR INSERT WITH CHECK (
    concept_a IN (SELECT id FROM public.concepts WHERE user_id = auth.uid())
  );

-- =============================================================================
-- PHASE 3: Study Plans & Exams (Smart Study Scheduler)
-- =============================================================================
CREATE TABLE public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own study plans" ON public.study_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.study_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.study_plans(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME,
  duration_minutes INTEGER DEFAULT 30,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.study_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own plan items" ON public.study_plan_items
  FOR ALL USING (
    plan_id IN (SELECT id FROM public.study_plans WHERE user_id = auth.uid())
  );

CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  exam_date DATE NOT NULL,
  difficulty INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  confidence INTEGER DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  actual_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own exams" ON public.exams
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- PHASE 3: Flashcards (Spaced Repetition System)
-- =============================================================================
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  tags TEXT[],
  ease_factor DECIMAL(4,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own flashcards" ON public.flashcards
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_flashcards_review ON public.flashcards(user_id, next_review_date);

CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quality INTEGER CHECK (quality BETWEEN 0 AND 5),
  time_taken_ms INTEGER,
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own flashcard reviews" ON public.flashcard_reviews
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- PHASE 4: Gamification
-- =============================================================================
CREATE TABLE public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_study_minutes INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification" ON public.user_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" ON public.user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON public.user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'))
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- Seed default achievements
INSERT INTO public.achievements (code, name, description, icon, xp_reward, rarity) VALUES
  ('on_fire', 'On Fire', '7-day study streak', '🔥', 200, 'uncommon'),
  ('bookworm', 'Bookworm', '10 documents uploaded', '📚', 150, 'common'),
  ('einstein', 'Einstein', '100% on a mock exam', '🧠', 500, 'epic'),
  ('gladiator', 'Gladiator', 'Win 10 exam battles', '⚔️', 300, 'rare'),
  ('sharp_shooter', 'Sharp Shooter', '50 correct answers in a row', '🎯', 400, 'rare'),
  ('feynman', 'Feynman', 'Complete 20 Feynman sessions', '🌟', 350, 'epic'),
  ('first_steps', 'First Steps', 'Upload your first document', '👶', 50, 'common'),
  ('night_owl', 'Night Owl', 'Study after midnight', '🦉', 100, 'uncommon'),
  ('marathon', 'Marathon', 'Study for 4 hours straight', '🏃', 250, 'rare'),
  ('social_butterfly', 'Social Butterfly', 'Win your first exam battle', '🦋', 100, 'common');

CREATE TABLE public.user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- AUTO-CREATE SUBSCRIPTION & GAMIFICATION ON USER SIGNUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  INSERT INTO public.user_gamification (user_id)
  VALUES (NEW.id);

  INSERT INTO public.elo_ratings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- FULL-TEXT SEARCH INDEX for documents
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm ON public.documents USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_documents_text_trgm ON public.documents USING gin (extracted_text gin_trgm_ops);
