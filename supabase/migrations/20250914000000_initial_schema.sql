-- ====================================================================
-- ADHYAY DATABASE MIGRATION: 001_initial_schema.sql
-- Production Schema for ADHYAY AI Study Companion
-- Includes: Auth, Profiles, Videos, Materials, Notes, Questions,
--           Tests, Flashcards, Friends, Groups, Doubts, XP & Badges
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    friend_code TEXT UNIQUE NOT NULL,
    education_type TEXT DEFAULT 'school',
    board_or_exam TEXT DEFAULT 'CBSE',
    class_grade TEXT DEFAULT 'Class 12',
    stream TEXT DEFAULT 'Science (PCM)',
    target_exam TEXT DEFAULT 'Board & Competitive Exams',
    xp INTEGER DEFAULT 120,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 1,
    last_active_date DATE DEFAULT CURRENT_DATE,
    today_study_minutes INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VIDEOS & LECTURES
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    youtube_video_id TEXT,
    title TEXT NOT NULL,
    channel_title TEXT,
    duration_seconds INTEGER,
    thumbnail_url TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VIDEO ANALYSIS & STUDY PACKS
CREATE TABLE IF NOT EXISTS video_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    detected_subject TEXT,
    detected_topic TEXT,
    detected_chapter TEXT,
    estimated_academic_level TEXT,
    is_ai_estimated BOOLEAN DEFAULT TRUE,
    overview TEXT,
    video_chapters JSONB DEFAULT '[]'::jsonb,
    uncertainties JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDY MATERIALS & STUDY VAULT
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'youtube', 'pdf', 'image', 'handwritten', 'notes', etc.
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT NOT NULL,
    academic_level TEXT,
    source_url TEXT,
    raw_text TEXT,
    summary TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTES (Multi-format & Grounded)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    complete_text TEXT,
    easy_text TEXT,
    revision_text TEXT,
    ultra_quick_text TEXT,
    formula_sheet JSONB DEFAULT '[]'::jsonb,
    definitions JSONB DEFAULT '[]'::jsonb,
    derivations JSONB DEFAULT '[]'::jsonb,
    examples JSONB DEFAULT '[]'::jsonb,
    common_mistakes JSONB DEFAULT '[]'::jsonb,
    exceptions JSONB DEFAULT '[]'::jsonb,
    diagrams JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'mcq', 'numerical', 'short', 'long', 'assertion_reason', 'case_based', 'hots', 'viva'
    text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    hints JSONB DEFAULT '[]'::jsonb,
    marks INTEGER DEFAULT 1,
    difficulty TEXT DEFAULT 'medium',
    is_pyq BOOLEAN DEFAULT FALSE,
    pyq_source TEXT,
    source_concept TEXT,
    timestamp_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUESTION ATTEMPTS
CREATE TABLE IF NOT EXISTS question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TESTS
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT,
    total_questions INTEGER DEFAULT 10,
    duration_minutes INTEGER DEFAULT 15,
    difficulty TEXT DEFAULT 'normal',
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEST ATTEMPTS
CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_marks NUMERIC(5,2) NOT NULL,
    accuracy NUMERIC(5,2) NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    user_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    weak_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    strong_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FLASHCARDS
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    type TEXT DEFAULT 'concept',
    subject TEXT,
    chapter TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FLASHCARD PROGRESS (Spaced Repetition)
CREATE TABLE IF NOT EXISTS flashcard_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0, -- 0 to 5
    interval_days INTEGER DEFAULT 1,
    ease_factor NUMERIC(3,2) DEFAULT 2.50,
    review_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMPTZ DEFAULT NOW(),
    next_review_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
    UNIQUE(user_id, flashcard_id)
);

-- 12. STUDY SESSIONS
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE SET NULL,
    subject TEXT,
    topic TEXT,
    duration_minutes INTEGER NOT NULL,
    session_type TEXT DEFAULT 'video', -- 'video', 'notes', 'practice', 'recall', 'test'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WEAK TOPICS & MASTERY
CREATE TABLE IF NOT EXISTS weak_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    mistake_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'needs_practice', -- 'needs_practice', 'reviewing', 'mastered'
    last_tested TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject, topic)
);

-- 14. FRIENDS & SOCIAL
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- 15. STUDY GROUPS
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General Study',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT TRUE,
    invite_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_type TEXT,
    attachment_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, material_id)
);

-- 16. DOUBTS COMMUNITY
CREATE TABLE IF NOT EXISTS doubts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    attachments JSONB DEFAULT '[]'::jsonb,
    is_resolved BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doubt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doubt_id UUID REFERENCES doubts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_grade TEXT,
    is_ai BOOLEAN DEFAULT FALSE,
    is_best_answer BOOLEAN DEFAULT FALSE,
    text TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'friend_request', 'friend_accepted', 'group_invite', 'doubt_answer', 'test_result', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. GAMIFICATION: XP EVENTS & BADGES
CREATE TABLE IF NOT EXISTS xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- ====================================================================
-- INDEXES FOR FAST COMMON QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_materials_user ON study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analysis_video ON video_analysis(video_id);
CREATE INDEX IF NOT EXISTS idx_notes_material ON notes(material_id);
CREATE INDEX IF NOT EXISTS idx_questions_material ON questions(material_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user ON flashcard_progress(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_weak_topics_user ON weak_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_doubts_subject ON doubts(subject);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view basic profile info, user can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Study materials: Private to user
CREATE POLICY "Users can manage own materials" ON study_materials FOR ALL USING (auth.uid() = user_id);

-- Videos and Analysis: Private to user
CREATE POLICY "Users can manage own videos" ON videos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own video analysis" ON video_analysis FOR ALL USING (auth.uid() = user_id);

-- Notes: Private to user
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- Questions & Attempts: Private to user
CREATE POLICY "Users can view and manage own questions" ON questions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own question attempts" ON question_attempts FOR ALL USING (auth.uid() = user_id);

-- Tests & Test Attempts: Private to user
CREATE POLICY "Users can manage own tests" ON tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own test attempts" ON test_attempts FOR ALL USING (auth.uid() = user_id);

-- Flashcards & Progress: Private to user
CREATE POLICY "Users can manage own flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own flashcard progress" ON flashcard_progress FOR ALL USING (auth.uid() = user_id);

-- Study Sessions & Weak Topics: Private to user
CREATE POLICY "Users can manage own study sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own weak topics" ON weak_topics FOR ALL USING (auth.uid() = user_id);

-- Friends: Authenticated user can see their own friends
CREATE POLICY "Users can see their friends" ON friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can manage friend requests" ON friend_requests FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Groups: Members can view group details, messages, and materials
CREATE POLICY "Members can view groups they belong to" ON groups FOR SELECT
USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) OR is_private = false);

CREATE POLICY "Group members can view messages" ON group_messages FOR SELECT
USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Group members can send messages" ON group_messages FOR INSERT
WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Doubts: Publicly viewable for collaborative learning, authenticated users can create doubts and answers
CREATE POLICY "Doubts are viewable by all students" ON doubts FOR SELECT USING (true);
CREATE POLICY "Students can create doubts" ON doubts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can edit own doubts" ON doubts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doubt answers are viewable by all" ON doubt_answers FOR SELECT USING (true);
CREATE POLICY "Students can submit doubt answers" ON doubt_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Only visible to the recipient user
CREATE POLICY "Users view their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
