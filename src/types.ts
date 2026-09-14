export type EducationType = 'school' | 'college' | 'competitive';
export type ExplanationMode = 'beginner' | 'exam_ready' | 'step_by_step' | 'hinglish';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard';
export type QuestionType =
  | 'mcq'
  | 'short'
  | 'long'
  | 'numerical'
  | 'assertion_reason'
  | 'case_based'
  | 'hots'
  | 'viva';

export interface SolvedQuestionResponse {
  finalAnswer: string;
  concept: string;
  formulaUsed: string;
  stepMarkingBreakdown: Array<{
    stepNumber: number;
    description: string;
    working: string;
    marksAwarded: string;
  }>;
  commonMistakeWarning?: string;
  similarPracticeQuestion?: {
    text: string;
    answer: string;
  };
}

export interface ActiveRecallEvaluation {
  accuracyScore: number;
  keyConceptsCovered: string[];
  missingNuances: string[];
  examinerTip: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  username?: string;
  friendCode?: string;
  educationType: EducationType;
  boardOrExam: string; // e.g. "CBSE", "ICSE", "JEE Main", "NEET-UG", "Maharashtra State Board", "UPSC"
  classGrade: string; // e.g. "Class 12", "Class 11", "Class 10", "B.Tech 2nd Year"
  stream: string; // e.g. "Science (PCM)", "Science (PCB)", "Commerce", "Arts", "Computer Science"
  subjects: string[];
  targetExam: string;
  targetExamDate?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  todayStudyMinutes: number;
  weakTopics: string[];
  strongTopics: string[];
  badges: Badge[];
  privacy: {
    showProfileInDoubts: boolean;
    showStatsOnLeaderboard: boolean;
  };
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  title?: string;
  description: string;
  unlockedAt: string;
  category: 'streak' | 'accuracy' | 'mastery' | 'community' | 'tests';
}

export type MaterialType =
  | 'pdf'
  | 'image'
  | 'handwritten'
  | 'typed'
  | 'youtube'
  | 'paper'
  | 'generated_notes'
  | 'flashcards'
  | 'test';

export interface GeneratedNotesFormat {
  complete: string;
  easy: string;
  revision: string;
  ultraQuick: string;
  formulaSheet: Array<{
    formula: string;
    description: string;
    symbols: string;
    units: string;
    conditions: string;
    whenToUse: string;
  }>;
  definitions: Array<{
    term: string;
    definition: string;
    importance: string;
  }>;
  derivations: Array<{
    title: string;
    steps: string[];
    keyTakeaway: string;
  }>;
  examples: Array<{
    problem: string;
    solution: string;
    examTip: string;
  }>;
  commonMistakes: Array<{
    mistake: string;
    whyWrong: string;
    correctWay: string;
  }>;
  exceptions: Array<{
    rule: string;
    exception: string;
    examCaution: string;
  }>;
  diagrams: Array<{
    title: string;
    description: string;
    keyLabels: string[];
  }>;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'definition' | 'formula' | 'concept' | 'qa' | 'active_recall' | 'mistake';
  subject: string;
  chapter: string;
  masteryLevel: number; // 0 to 5
  lastReviewed?: string;
  nextReviewDate?: string;
}

export interface Question {
  id: string;
  type:
    | 'mcq'
    | 'short'
    | 'long'
    | 'numerical'
    | 'assertion_reason'
    | 'case_based'
    | 'hots'
    | 'viva';
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  stepByStepSolution?: {
    given?: string;
    required?: string;
    formula?: string;
    substitution?: string;
    calculation?: string;
    finalAnswer?: string;
    unit?: string;
    notes?: string;
  };
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  pyqSource?: string; // e.g., "CBSE 2023 Set 1", "JEE Main 2024 Shift 2", "NEET 2022"
  isPyq?: boolean;
  isHighPriority?: boolean;
  topic?: string;
  chapter?: string;
  subject?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: MaterialType;
  subject: string;
  chapter: string;
  topic: string;
  academicLevel: string;
  originalFileName?: string;
  sourceUrl?: string;
  rawText?: string;
  imageUrl?: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isFavorite: boolean;
  notes?: GeneratedNotesFormat;
  flashcards?: Flashcard[];
  questions?: Question[];
  videoChapters?: Array<{
    timestamp: string;
    seconds: number;
    title: string;
    summary: string;
  }>;
}

export interface MockTest {
  id: string;
  title: string;
  subject: string;
  chapter?: string;
  chapters?: string[];
  totalQuestions: number;
  durationMinutes: number;
  difficulty?: 'nice' | 'normal' | 'tough' | 'very_tough' | 'brutal' | 'easy' | 'medium' | 'hard';
  questionStyle?: 'textbook' | 'pyq_heavy' | 'conceptual' | 'application_heavy' | 'numerical_heavy' | 'tricky' | 'mixed' | string;
  questions: Question[];
  userAnswers?: Record<string, string>;
  isCompleted: boolean;
  score?: number;
  totalMarks?: number;
  accuracy?: number;
  timeSpentSeconds?: number;
  createdAt?: string;
  completedAt?: string;
  weakTopics?: string[];
  strongTopics?: string[];
  recommendedRevision?: string[];
}

export interface DoubtAnswer {
  id: string;
  authorName: string;
  authorGrade: string;
  authorAvatar?: string;
  isAI?: boolean;
  isTeacher?: boolean;
  isBestAnswer?: boolean;
  text: string;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  formula?: string;
  diagramUrl?: string;
}

export interface DoubtPost {
  id: string;
  authorId: string;
  authorName: string;
  authorGrade: string;
  authorAvatar: string;
  subject: string;
  chapter: string;
  title: string;
  description: string;
  attachments?: Array<{
    type: 'image' | 'voice' | 'formula' | 'diagram';
    url?: string;
    content?: string;
  }>;
  createdAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  answers: DoubtAnswer[];
  isResolved: boolean;
  isReported?: boolean;
  tags: string[];
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  progress: number;
  target: number;
  iconName: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  subject: string;
  chapter: string;
  status: 'mastered' | 'learning' | 'weak' | 'not_started';
  masteryPercentage: number;
  prerequisites?: string[];
  subtopics?: string[];
}

export interface TeacherPaperAnalysis {
  id: string;
  title: string;
  teacherOrInstitute: string;
  profile: {
    directTextbook: number;
    conceptual: number;
    application: number;
    numerical: number;
    tricky: number;
  };
  keyPatterns: string[];
  repeatedQuestionTypes: string[];
  highYieldTopics: string[];
  preparationAdvice: string;
}

export interface ActiveRecallSession {
  id: string;
  subject: string;
  chapter: string;
  promptConcept: string;
  userAnswer: string;
  evaluatedScore: number; // 0 - 100
  accuracy: 'excellent' | 'good' | 'needs_work' | 'incomplete';
  feedback: {
    strengths: string[];
    missingPoints: string[];
    conceptualCorrections: string[];
    modelAnswer: string;
  };
  createdAt: string;
}

export interface AnswerWritingCheckResult {
  estimatedMarks: number;
  maxMarks: number;
  relevanceScore: number;
  structureClarityScore: number;
  keywordScore: number;
  strengths: string[];
  missingElements: string[];
  stepMarkingBreakdown: Array<{
    step: string;
    awardedMarks: number;
    maxMarks: number;
    comment: string;
  }>;
  examinerTips: string[];
  modelAnswer: string;
}

export interface StudySprintPlan {
  durationMinutes: number;
  subject: string;
  topic: string;
  stages: Array<{
    stageNumber: number;
    title: string;
    duration: string;
    activityType: 'concept' | 'questions' | 'revision' | 'test';
    content: string;
    bulletPoints: string[];
  }>;
}
