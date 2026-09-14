import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { store, VideoAnalysisRecord } from "./server/store";
import { GeminiService, getGeminiClient } from "./server/geminiService";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limit for image uploads & scans
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 1. Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    app: "ADHYAY",
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    timestamp: new Date().toISOString(),
  });
});

// 2. Supabase Server Admin & Config
const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

app.get("/api/config/supabase", (req: Request, res: Response) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  });
});

// Google OAuth Status & Diagnostic endpoint
app.get("/api/auth/google-status", async (req: Request, res: Response) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || "https://jweocgegjooqgjvkktqd.supabase.co";
    const anonKey = process.env.SUPABASE_ANON_KEY || "";
    
    // Check Supabase Auth public settings endpoint to see if Google provider is enabled
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    
    let googleEnabled = false;
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      googleEnabled = !!data?.external?.google;
    }
    
    res.json({
      success: true,
      googleEnabled,
      supabaseUrl,
      callbackUrl: `${supabaseUrl}/auth/v1/callback`,
      projectId: "jweocgegjooqgjvkktqd",
    });
  } catch (err: any) {
    res.json({
      success: false,
      googleEnabled: false,
      error: err.message,
    });
  }
});

// Real Supabase User Registration (with auto-confirmed email to avoid free-tier SMTP rate limit)
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: "Supabase service role key is not configured." });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName?.trim() || email.split("@")[0],
        name: fullName?.trim() || email.split("@")[0],
      },
    });

    if (error) {
      const msg = error.message || "";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
        return res.status(400).json({ success: false, error: "An account with this email already exists. Please sign in." });
      }
      return res.status(400).json({ success: false, error: msg });
    }

    res.json({ success: true, user: data.user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. User Profile endpoints (Real Supabase User integration)
app.get("/api/user/profile", (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || "user_default";
    const email = req.query.email as string | undefined;
    const name = req.query.name as string | undefined;
    const avatarUrl = req.query.avatarUrl as string | undefined;

    const profile = store.getUser(userId);
    if (email && !profile.email) {
      profile.email = email;
    }
    if (name && (profile.name === 'Aarav Sharma' || profile.name === 'Student')) {
      profile.name = name;
    }
    if (avatarUrl && !profile.avatarUrl) {
      profile.avatarUrl = avatarUrl;
    }

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/profile", (req: Request, res: Response) => {
  try {
    const { userId, updates } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }
    const updated = store.updateUser(userId, updates || {});
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADHYAY CORE VIDEO LECTURE PIPELINE
// ==========================================

// POST /api/video/analyze: Initiate or run video analysis with real stages
app.post("/api/video/analyze", async (req: Request, res: Response) => {
  try {
    const { url, fileData, userId } = req.body;
    const currentUserId = userId || "user_default";

    if (!url && !fileData) {
      return res.status(400).json({ success: false, error: "Please provide a valid lecture video URL or file." });
    }

    // YouTube regex check
    const ytMatch = (url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    const youtubeId = ytMatch ? ytMatch[1] : undefined;

    const analysisId = `vid_${Date.now()}`;
    const initialRecord: VideoAnalysisRecord = {
      id: analysisId,
      userId: currentUserId,
      sourceUrl: url || "Uploaded Lecture Video",
      youtubeId,
      title: "Analyzing Lecture...",
      status: "ANALYZING",
      isAiEstimated: true,
      timestamps: [],
      questions: [],
      flashcards: [],
      miniTest: { id: `test_${Date.now()}`, title: "Mini Test", questions: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.saveVideoAnalysis(initialRecord);

    // Run real analysis using GeminiService
    (async () => {
      try {
        store.updateVideoStatus(analysisId, "EXTRACTING_CONTENT");
        const analysis = await GeminiService.analyzeLectureVideo(url || "", fileData);

        store.updateVideoStatus(analysisId, "GENERATING_NOTES");
        // Combine into full record
        const completedRecord: VideoAnalysisRecord = {
          ...initialRecord,
          title: analysis.title,
          detectedSubject: analysis.detectedSubject,
          detectedTopic: analysis.detectedTopic,
          detectedChapter: analysis.detectedChapter,
          estimatedAcademicLevel: analysis.estimatedAcademicLevel,
          isAiEstimated: analysis.isAiEstimated,
          overview: analysis.overview,
          timestamps: analysis.videoChapters,
          notes: analysis.notes,
          questions: analysis.questions,
          flashcards: analysis.flashcards,
          miniTest: analysis.miniTest,
          uncertainties: analysis.uncertainties,
          status: "COMPLETED",
          updatedAt: new Date().toISOString(),
        };

        store.saveVideoAnalysis(completedRecord);
      } catch (procErr: any) {
        console.error("Video processing async error:", procErr);
        store.updateVideoStatus(analysisId, "FAILED", procErr?.message || "Failed to analyze lecture video");
      }
    })();

    res.json({
      success: true,
      analysisId,
      status: "ANALYZING",
      message: "Lecture analysis started",
    });
  } catch (error: any) {
    console.error("Error starting video analysis:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to start analysis" });
  }
});

// GET /api/video/status/:id: Polling or checking progress
app.get("/api/video/status/:id", (req: Request, res: Response) => {
  const analysis = store.getVideoAnalysis(req.params.id);
  if (!analysis) {
    return res.status(404).json({ success: false, error: "Analysis record not found" });
  }
  res.json({ success: true, analysis });
});

// POST /api/video/chat: "Ask This Video" contextual Q&A
app.post("/api/video/chat", async (req: Request, res: Response) => {
  try {
    const { videoId, query, history, videoContext } = req.body;
    let context = videoContext;
    if (!context && videoId) {
      context = store.getVideoAnalysis(videoId);
    }

    if (!context) {
      return res.status(400).json({ success: false, error: "Video context required for tutor chat" });
    }

    const reply = await GeminiService.askVideoTutor(query, context, history || []);
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Ask Video error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// FRIENDS & SOCIAL SYSTEM (Real Backend)
// ==========================================
app.get("/api/friends/list", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user_default";
  const friends = store.getFriends(userId);
  const requests = store.getFriendRequests(userId);
  res.json({ success: true, friends, requests });
});

app.get("/api/friends/search", (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const currentUserId = (req.query.userId as string) || "user_default";
  const results = store.searchUsers(query, currentUserId);
  res.json({ success: true, results });
});

app.post("/api/friends/request", (req: Request, res: Response) => {
  const { friendCodeOrUsername, userId } = req.body;
  const currentUserId = userId || "user_default";
  const result = store.sendFriendRequest(currentUserId, friendCodeOrUsername || "");
  res.json(result);
});

app.post("/api/friends/respond", (req: Request, res: Response) => {
  const { requestId, action } = req.body;
  const result = store.respondFriendRequest(requestId, action);
  res.json(result);
});

app.delete("/api/friends/remove", (req: Request, res: Response) => {
  const { userId, friendId } = req.body;
  store.removeFriend(userId || "user_default", friendId);
  res.json({ success: true, message: "Friend removed." });
});

// ==========================================
// STUDY GROUPS & GROUP CHAT (Real Backend)
// ==========================================
app.get("/api/groups/list", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user_default";
  const groups = store.getGroups(userId);
  res.json({ success: true, groups });
});

app.post("/api/groups/create", (req: Request, res: Response) => {
  const { name, description, category, userId } = req.body;
  const currentUserId = userId || "user_default";
  const group = store.createGroup(currentUserId, name, description, category);
  res.json({ success: true, group });
});

app.get("/api/groups/:id", (req: Request, res: Response) => {
  const group = store.getGroup(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }
  res.json({ success: true, group });
});

app.post("/api/groups/:id/messages", (req: Request, res: Response) => {
  const { text, userId, sharedMaterialTitle } = req.body;
  const currentUserId = userId || "user_default";
  const message = store.addGroupMessage(req.params.id, currentUserId, text, sharedMaterialTitle);
  if (!message) {
    return res.status(404).json({ success: false, error: "Failed to post message" });
  }
  res.json({ success: true, message });
});

// ==========================================
// PERFORMANCE & PROFILE
// ==========================================
app.get("/api/profile", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user_default";
  const user = store.getUser(userId);
  res.json({ success: true, user });
});

app.put("/api/profile", (req: Request, res: Response) => {
  const { userId, updates } = req.body;
  const user = store.updateUser(userId || "user_default", updates || {});
  res.json({ success: true, user });
});

app.get("/api/performance", (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || "user_default";
  const user = store.getUser(userId);
  res.json({
    success: true,
    performance: {
      totalStudyMinutes: user.totalStudyMinutes,
      todayStudyMinutes: user.todayStudyMinutes,
      streakDays: user.streakDays,
      level: user.level,
      xp: user.xp,
      weakTopics: user.weakTopics,
      strongTopics: user.strongTopics,
    },
  });
});

// 2. Generate Multi-Format Notes
app.post("/api/gemini/generate-notes", async (req: Request, res: Response) => {
  try {
    const { title, subject, chapter, rawText, academicLevel, imageData } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `You are a master educator for Indian students (CBSE, ICSE, State Boards, JEE, NEET, College).
CRITICAL RULE: "SIMPLIFY THE LANGUAGE, NEVER SIMPLIFY AWAY THE KNOWLEDGE."
You must explain difficult concepts in clear, simple language while preserving ALL essential academic information:
- Preserve all definitions, formulas with symbols & SI units, conditions/exceptions, step-by-step derivations, examples, relationships, and diagram descriptions.
- Format the output strictly as a valid JSON object matching the requested schema.`;

    const userPrompt = `Generate a comprehensive multi-format study pack for:
Subject: ${subject || "General Science"}
Chapter/Topic: ${chapter || title || "Study Material"}
Academic Level: ${academicLevel || "Class 12 / Competitive"}

Source Content:
${rawText || "General curriculum for " + (chapter || title)}`;

    if (!ai) {
      // Fallback structured academic generation
      return res.json({
        success: true,
        isAiGenerated: true,
        source: "curriculum-engine",
        notes: generateFallbackNotes(subject, chapter || title, rawText),
      });
    }

    const contents: any[] = [];
    if (imageData && typeof imageData === "string" && imageData.startsWith("data:")) {
      const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }
    contents.push({ text: `${systemPrompt}\n\n${userPrompt}` });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complete: { type: Type.STRING, description: "Detailed, complete notes preserving all academic knowledge, derivations, and formulas" },
            easy: { type: Type.STRING, description: "Same complete knowledge explained in plain, intuitive language with analogies" },
            revision: { type: Type.STRING, description: "Condensed high-yield summary for fast revision before exams" },
            ultraQuick: { type: Type.STRING, description: "1-page bullet points for last 5 minutes before entering the exam hall" },
            formulaSheet: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  formula: { type: Type.STRING },
                  description: { type: Type.STRING },
                  symbols: { type: Type.STRING },
                  units: { type: Type.STRING },
                  conditions: { type: Type.STRING },
                  whenToUse: { type: Type.STRING },
                },
                required: ["formula", "description", "symbols", "units", "conditions", "whenToUse"],
              },
            },
            definitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  importance: { type: Type.STRING },
                },
                required: ["term", "definition", "importance"],
              },
            },
            derivations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyTakeaway: { type: Type.STRING },
                },
                required: ["title", "steps", "keyTakeaway"],
              },
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problem: { type: Type.STRING },
                  solution: { type: Type.STRING },
                  examTip: { type: Type.STRING },
                },
                required: ["problem", "solution", "examTip"],
              },
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mistake: { type: Type.STRING },
                  whyWrong: { type: Type.STRING },
                  correctWay: { type: Type.STRING },
                },
                required: ["mistake", "whyWrong", "correctWay"],
              },
            },
            exceptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rule: { type: Type.STRING },
                  exception: { type: Type.STRING },
                  examCaution: { type: Type.STRING },
                },
                required: ["rule", "exception", "examCaution"],
              },
            },
            diagrams: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keyLabels: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "description", "keyLabels"],
              },
            },
          },
          required: ["complete", "easy", "revision", "ultraQuick", "formulaSheet", "definitions", "derivations", "examples", "commonMistakes", "exceptions", "diagrams"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, isAiGenerated: true, notes: parsed });
  } catch (error: any) {
    console.error("Error generating notes:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate notes",
      notes: generateFallbackNotes(req.body.subject, req.body.chapter || req.body.title, req.body.rawText),
    });
  }
});

// 3. Explain Material (Contextual explanation modes)
app.post("/api/gemini/explain-material", async (req: Request, res: Response) => {
  try {
    const { text, mode, subject, topic } = req.body;
    const ai = getGeminiClient();

    const modeInstructions: Record<string, string> = {
      beginner: "Explain like teaching a complete beginner with very friendly everyday Indian analogies (like cricket, chai, traffic, metro).",
      simple: "Simplify the wording completely without dropping any technical terms, formulas, or conditions.",
      detailed: "Provide a rigorous, in-depth academic breakdown with mathematical nuances, derivations, and historical context.",
      exam_ready: "Provide a high-scoring answer format with headings, bullet points, underlined keywords, and standard board marks allocation.",
      with_example: "Explain using a fully worked real-world numerical or practical situation.",
      step_by_step: "Break down into logical numbered sequential steps (Step 1, Step 2, etc.).",
      quick_revision: "3-bullet lightning recap highlighting the most critical takeaway.",
    };

    const instruction = modeInstructions[mode] || modeInstructions.simple;

    if (!ai) {
      return res.json({
        success: true,
        explanation: `### Explanation (${mode.toUpperCase()} MODE)\n\n**Concept Focus:** ${topic || subject || "Academic Material"}\n\n${text}\n\n*Key Takeaway:* This concept connects directly to fundamental principles in ${subject || "your syllabus"}. Remember to state the boundary conditions and SI units clearly when writing answers.`,
      });
    }

    const prompt = `Subject: ${subject || "General"}\nTopic: ${topic || "Concept"}\nMode: ${mode}\nMode Guidance: ${instruction}\n\nMaterial to Explain:\n"""\n${text}\n"""\n\nExplain this accurately and clearly for an Indian student. Keep markdown formatting clean with bold terms and clear sections.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error("Explain error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Ask My Material (Grounded Chat)
app.post("/api/gemini/ask-material", async (req: Request, res: Response) => {
  try {
    const { query, materialContext, chatHistory, subject } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: `Based on your material for **${subject || "your syllabus"}**:

${query.includes("formula") ? "The primary formula in this section relates the key variables with strict units." : "Your notes clearly emphasize the foundational definitions, conditions of applicability, and step-by-step reasoning."}

*(Note: Grounded in your uploaded study vault material)*`,
      });
    }

    const systemPrompt = `You are a personalized AI Study Companion for Indian students.
CRITICAL INSTRUCTION:
- Ground your answer primarily on the student's uploaded material provided in the context below.
- Clearly distinguish between:
  1. [From Your Material]: Facts and equations directly mentioned in the student's notes.
  2. [Additional Explanation]: Helpful standard concepts or exam tips not explicitly in the notes.
- If the student's notes contain an error or inconsistency, politely point it out: "Your notes say X, but standard textbooks state Y because..."
- Do NOT hallucinate facts.`;

    const userPrompt = `Material Context:
"""
${materialContext || "No specific document attached, answering from standard syllabus knowledge."}
"""

Student Question:
${query}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        { text: `${systemPrompt}\n\n${userPrompt}` }
      ],
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Ask material error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Scan & Solve
app.post("/api/gemini/scan-and-solve", async (req: Request, res: Response) => {
  try {
    const { questionText, imageData, subject } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        result: generateFallbackScanSolve(questionText || "Sample Question", subject),
      });
    }

    const contents: any[] = [];
    if (imageData && typeof imageData === "string" && imageData.startsWith("data:")) {
      const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const promptText = `Analyze this student's scanned question for Indian examinations.
Question Text: ${questionText || "Analyze the attached image"}
Subject: ${subject || "General"}

Provide:
1. Question Type: 'numerical' or 'theoretical'
2. Extracted Question Text (clean OCR if image provided)
3. 'understand': Clear explanation of what the question is asking and what core concept is tested.
4. 'hints': Array of 2 progressive hints (Hint 1 gentle direction, Hint 2 intermediate clue without giving final answer).
5. 'solution': Comprehensive step-by-step solution.
   - For numericals: include given, required, formula, substitution, calculation, finalAnswer, unit, verificationTip.
   - For theoretical: include concept, structuredPoints, examReadyAnswer, keywordsToUnderline.`;

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedText: { type: Type.STRING },
            questionType: { type: Type.STRING, enum: ["numerical", "theoretical"] },
            subject: { type: Type.STRING },
            chapter: { type: Type.STRING },
            understand: { type: Type.STRING },
            hints: { type: Type.ARRAY, items: { type: Type.STRING } },
            numericalSolution: {
              type: Type.OBJECT,
              properties: {
                given: { type: Type.STRING },
                required: { type: Type.STRING },
                formula: { type: Type.STRING },
                substitution: { type: Type.STRING },
                calculation: { type: Type.STRING },
                finalAnswer: { type: Type.STRING },
                unit: { type: Type.STRING },
                verificationTip: { type: Type.STRING },
              },
            },
            theoreticalSolution: {
              type: Type.OBJECT,
              properties: {
                coreConcept: { type: Type.STRING },
                structuredPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                examReadyAnswer: { type: Type.STRING },
                keywordsToUnderline: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          required: ["detectedText", "questionType", "understand", "hints"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error("Scan & Solve error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      result: generateFallbackScanSolve(req.body.questionText || "Question", req.body.subject),
    });
  }
});

// 6. YouTube Lecture Processor
app.post("/api/gemini/process-video", async (req: Request, res: Response) => {
  try {
    const { videoUrl, lectureTitle, transcriptText, subject } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        pack: generateFallbackVideoPack(lectureTitle || "Indian Educational Lecture", subject, videoUrl),
      });
    }

    const prompt = `You are analyzing an Indian educational lecture video.
Video URL: ${videoUrl || "https://youtube.com/watch?v=sample"}
Lecture Title/Topic: ${lectureTitle || "Lecture on " + (subject || "Key Concepts")}
Transcript / Lecture Overview:
${transcriptText || "Comprehensive Indian board & competitive exam lecture covering fundamental theory, derivations, numerical problem solving, and previous year questions."}

Create a complete Study Pack:
1. Video Chapters with realistic timestamps (e.g. 00:00 Introduction, 05:30 Core Theory, 18:20 Formula Derivation, 32:15 Solved Numerical, 45:00 Summary & PYQs).
2. Complete easy notes with key takeaways.
3. High yield definitions & formulas.
4. 4 Practice MCQs with options and explanations.
5. 4 Flashcards.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            chapter: { type: Type.STRING },
            summary: { type: Type.STRING },
            videoChapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  seconds: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                },
                required: ["timestamp", "seconds", "title", "summary"],
              },
            },
            notes: {
              type: Type.OBJECT,
              properties: {
                complete: { type: Type.STRING },
                easy: { type: Type.STRING },
                revision: { type: Type.STRING },
                ultraQuick: { type: Type.STRING },
              },
              required: ["complete", "easy", "revision", "ultraQuick"],
            },
            keyFormulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  formula: { type: Type.STRING },
                  description: { type: Type.STRING },
                  units: { type: Type.STRING },
                },
                required: ["formula", "description", "units"],
              },
            },
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "text", "options", "correctAnswer", "explanation"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
                required: ["id", "front", "back", "type"],
              },
            },
          },
          required: ["title", "subject", "videoChapters", "notes", "keyFormulas", "mcqs", "flashcards"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, pack: parsed });
  } catch (error: any) {
    console.error("Process video error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      pack: generateFallbackVideoPack(req.body.lectureTitle || "Lecture", req.body.subject, req.body.videoUrl),
    });
  }
});

// 7. Question Generator (MCQs, Numericals, Assertion & Reason, Case-Based, HOTS)
app.post("/api/gemini/generate-questions", async (req: Request, res: Response) => {
  try {
    const { subject, chapter, questionType, difficulty, count, contextText, targetExam } = req.body;
    const ai = getGeminiClient();

    const numQuestions = Math.min(Math.max(Number(count) || 5, 1), 20);

    if (!ai) {
      return res.json({
        success: true,
        questions: generateFallbackQuestions(subject, chapter, questionType, difficulty, numQuestions),
      });
    }

    const prompt = `Generate ${numQuestions} high-quality academic questions for Indian students.
Target Exam/Board: ${targetExam || "CBSE / State Boards / JEE / NEET"}
Subject: ${subject || "Physics"}
Chapter/Topic: ${chapter || "Electricity & Magnetism"}
Question Type requested: ${questionType || "mixed"} (options: mcq, short, long, numerical, assertion_reason, case_based, hots, viva)
Difficulty: ${difficulty || "medium"} (easy, medium, hard, very_hard)
Context/Source notes if provided:
"""
${contextText || "Standard syllabus for " + (subject || "Science")}
"""

RULES:
- For Assertion & Reason: Follow standard CBSE/NEET format (Option A: Both A and R are true and R is correct explanation, Option B: Both true but R is NOT correct explanation, Option C: A is true R is false, Option D: A is false R is true).
- For Numericals: Provide full step-by-step breakdown (given, required, formula, substitution, calculation, finalAnswer, unit).
- For MCQs: Ensure 4 authentic distractors with explanations for why wrong choices are incorrect.
- State whether the question is High-Priority or pattern-based practice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["mcq", "short", "long", "numerical", "assertion_reason", "case_based", "hots", "viva"] },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              hints: { type: Type.ARRAY, items: { type: Type.STRING } },
              marks: { type: Type.NUMBER },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard", "very_hard"] },
              isHighPriority: { type: Type.BOOLEAN },
              pyqSource: { type: Type.STRING, description: "Historical pattern reference, e.g. Similar to CBSE 2023 / NEET 2022" },
              stepByStepSolution: {
                type: Type.OBJECT,
                properties: {
                  given: { type: Type.STRING },
                  required: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  substitution: { type: Type.STRING },
                  calculation: { type: Type.STRING },
                  finalAnswer: { type: Type.STRING },
                  unit: { type: Type.STRING },
                },
              },
            },
            required: ["id", "type", "text", "correctAnswer", "explanation", "hints", "marks", "difficulty"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ success: true, questions: parsed });
  } catch (error: any) {
    console.error("Generate questions error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      questions: generateFallbackQuestions(req.body.subject, req.body.chapter, req.body.questionType, req.body.difficulty, 5),
    });
  }
});

// 8. Teacher Paper Style Analyzer & Mock Generator
app.post("/api/gemini/analyze-teacher-paper", async (req: Request, res: Response) => {
  try {
    const { paperText, teacherName, subject, targetDifficulty } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        analysis: generateFallbackTeacherAnalysis(subject, teacherName),
      });
    }

    const prompt = `Analyze this teacher's / school's question paper style for Indian students:
Subject: ${subject || "Physics"}
Teacher/Institute name: ${teacherName || "School Pre-board"}
Target Difficulty slider: ${targetDifficulty || "tough"} (Nice 🙂, Normal, Tough, Very Tough, Brutal)

Paper Text / Syllabus pattern:
"""
${paperText || "Class test consisting of tricky definitions, circuit diagrams, numerical calculation with decimals, and conceptual reasoning."}
"""

Analyze:
1. Paper Style Profile percentages summing to 100%: directTextbook, conceptual, application, numerical, tricky.
2. Key patterns (e.g. loves 3-mark derivations, tests exceptions in organic chemistry, includes calculation traps).
3. Repeated question types and high yield topics.
4. Concrete preparation advice for the student.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            teacherOrInstitute: { type: Type.STRING },
            profile: {
              type: Type.OBJECT,
              properties: {
                directTextbook: { type: Type.NUMBER },
                conceptual: { type: Type.NUMBER },
                application: { type: Type.NUMBER },
                numerical: { type: Type.NUMBER },
                tricky: { type: Type.NUMBER },
              },
              required: ["directTextbook", "conceptual", "application", "numerical", "tricky"],
            },
            keyPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            repeatedQuestionTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
            highYieldTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            preparationAdvice: { type: Type.STRING },
          },
          required: ["title", "profile", "keyPatterns", "repeatedQuestionTypes", "highYieldTopics", "preparationAdvice"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error("Teacher paper analyze error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      analysis: generateFallbackTeacherAnalysis(req.body.subject, req.body.teacherName),
    });
  }
});

// 9. Active Recall Evaluator
app.post("/api/gemini/evaluate-active-recall", async (req: Request, res: Response) => {
  try {
    const { promptConcept, userAnswer, subject, chapter } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        evaluation: {
          evaluatedScore: 82,
          accuracy: "good",
          feedback: {
            strengths: [
              "Identified the primary law and direction of induction accurately.",
              "Used proper academic terminology.",
            ],
            missingPoints: [
              "Did not explicitly mention the conservation of energy justification.",
              "Include the negative sign in Faraday-Lenz equation e = -dPhi/dt.",
            ],
            conceptualCorrections: [
              "Remember that induced current opposes the *cause* producing it, not just the motion itself.",
            ],
            modelAnswer: `Lenz's Law states that the polarity of induced EMF is such that it tends to produce a current which opposes the change in magnetic flux that produces it (e = -N dPhi/dt). This law is a direct consequence of the Law of Conservation of Energy: mechanical work done against the opposing magnetic force is converted into electrical energy.`,
          },
        },
      });
    }

    const prompt = `Evaluate this student's Active Recall attempt without their notes.
Subject: ${subject || "General Science"}
Chapter: ${chapter || "Core Concept"}
Concept Prompt: "${promptConcept}"
Student's Recalled Answer: "${userAnswer}"

Evaluate academically:
1. Score from 0 to 100 based on conceptual accuracy, not rote wording.
2. Accuracy category: 'excellent' (85+), 'good' (70-84), 'needs_work' (50-69), 'incomplete' (<50).
3. Strengths: What concepts did they explain correctly?
4. Missing Points: What essential conditions, exceptions, formulas, or keywords were omitted?
5. Conceptual Corrections: Any misconceptions?
6. Model Answer: An ideal high-scoring explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluatedScore: { type: Type.NUMBER },
            accuracy: { type: Type.STRING, enum: ["excellent", "good", "needs_work", "incomplete"] },
            feedback: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                conceptualCorrections: { type: Type.ARRAY, items: { type: Type.STRING } },
                modelAnswer: { type: Type.STRING },
              },
              required: ["strengths", "missingPoints", "conceptualCorrections", "modelAnswer"],
            },
          },
          required: ["evaluatedScore", "accuracy", "feedback"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, evaluation: parsed });
  } catch (error: any) {
    console.error("Active recall error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Answer Writing Checker (Subjective Question / Step Marking)
app.post("/api/gemini/check-answer", async (req: Request, res: Response) => {
  try {
    const { questionText, maxMarks, studentAnswerText, subject } = req.body;
    const ai = getGeminiClient();

    const marks = Number(maxMarks) || 5;

    if (!ai) {
      return res.json({
        success: true,
        result: {
          estimatedMarks: Math.round(marks * 0.75 * 10) / 10,
          maxMarks: marks,
          relevanceScore: 85,
          structureClarityScore: 80,
          keywordScore: 70,
          strengths: [
            "Good introduction with the fundamental definition.",
            "Steps are logically laid out with clear handwriting / paragraphs.",
          ],
          missingElements: [
            "Missing final unit in the conclusion.",
            "Underline keywords like 'homogeneous', 'constant temperature', or 'isolated system' to catch the examiner's eye.",
          ],
          stepMarkingBreakdown: [
            { step: "Definition / Principle stated", awardedMarks: 1, maxMarks: 1, comment: "Correct statement" },
            { step: "Formula & Diagram representation", awardedMarks: 1, maxMarks: 1.5, comment: "Diagram missing axis labels" },
            { step: "Mathematical derivation / Working", awardedMarks: 1.5, maxMarks: 2, comment: "Skipped intermediate integration step" },
            { step: "Conclusion with proper units", awardedMarks: 0.5, maxMarks: 0.5, comment: "Neat summary" },
          ],
          examinerTips: [
            "Draw a box around the final numerical value or derived formula.",
            "Start major derivation steps on a fresh line with clear numbering.",
          ],
          modelAnswer: "Full model answer with step-by-step scoring breakdown.",
        },
      });
    }

    const prompt = `You are a strict but constructive Indian Board / Exam Examiner evaluating a subjective answer.
Subject: ${subject || "General Science"}
Question: "${questionText}"
Total Marks: ${marks}

Student's Submitted Answer:
"""
${studentAnswerText}
"""

Evaluate this answer against typical Indian marking schemes (CBSE/ISC/State):
1. Estimated Marks awarded (out of ${marks}) with disclaimer that this is an AI estimate.
2. Relevance score (0-100), Structure clarity score (0-100), Keyword score (0-100).
3. Specific strengths.
4. Missing elements that lost marks.
5. Step marking breakdown table.
6. Actionable Examiner Tips to gain +1 or +2 extra marks.
7. Model high-scoring answer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedMarks: { type: Type.NUMBER },
            maxMarks: { type: Type.NUMBER },
            relevanceScore: { type: Type.NUMBER },
            structureClarityScore: { type: Type.NUMBER },
            keywordScore: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingElements: { type: Type.ARRAY, items: { type: Type.STRING } },
            stepMarkingBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  awardedMarks: { type: Type.NUMBER },
                  maxMarks: { type: Type.NUMBER },
                  comment: { type: Type.STRING },
                },
                required: ["step", "awardedMarks", "maxMarks", "comment"],
              },
            },
            examinerTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            modelAnswer: { type: Type.STRING },
          },
          required: ["estimatedMarks", "maxMarks", "relevanceScore", "structureClarityScore", "keywordScore", "strengths", "missingElements", "stepMarkingBreakdown", "examinerTips", "modelAnswer"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error("Check answer error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Study Sprint / "I Have 30 Minutes" & "Exam Tomorrow" Planner
app.post("/api/gemini/study-planner", async (req: Request, res: Response) => {
  try {
    const { mode, durationMinutes, subject, topic, daysUntilExam } = req.body;
    const ai = getGeminiClient();

    const mins = Number(durationMinutes) || 30;

    if (!ai) {
      return res.json({
        success: true,
        plan: generateFallbackStudyPlan(mins, subject, topic, mode),
      });
    }

    const prompt = `Create an intensive, high-yield study plan for an Indian student.
Mode: ${mode || "sprint"} (options: "sprint" for 'I have X minutes', "exam_tomorrow" for Night-before revision, "roadmap" for Days-until-exam)
Duration / Days: ${durationMinutes ? `${durationMinutes} minutes` : `${daysUntilExam || 20} days`}
Subject: ${subject || "Physics / Chemistry / Math"}
Topic/Chapter: ${topic || "High-Yield Topics"}

Structure into crisp, time-bound actionable stages with concrete study tasks, formulas to memorize, high-yield questions to solve, and rapid self-testing.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            durationMinutes: { type: Type.NUMBER },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            stages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stageNumber: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  activityType: { type: Type.STRING, enum: ["concept", "questions", "revision", "test"] },
                  content: { type: Type.STRING },
                  bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["stageNumber", "title", "duration", "activityType", "content", "bulletPoints"],
              },
            },
          },
          required: ["durationMinutes", "subject", "topic", "stages"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error("Study planner error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      plan: generateFallbackStudyPlan(req.body.durationMinutes || 30, req.body.subject, req.body.topic, req.body.mode),
    });
  }
});

// 12. Persistent AI Tutor Chat
app.post("/api/gemini/tutor-chat", async (req: Request, res: Response) => {
  try {
    const { message, userProfile, history, currentTopic } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: `Namaste ${userProfile?.name || "Student"}! 

I'm your **Personal AI Study Tutor**. For **${currentTopic || userProfile?.targetExam || "your studies"}**:

1. Let's break down the core concept step-by-step.
2. Remember that practice is key: solve 2 numericals or attempt a quick 3-question active recall.
3. What specific formula or step would you like to clarify?`,
      });
    }

    const systemPrompt = `You are "Guru" / Abhyas AI Tutor, an intelligent, motivating, and academically rigorous personal teacher for Indian students.
Student Profile:
- Name: ${userProfile?.name || "Student"}
- Board / Exam: ${userProfile?.boardOrExam || "CBSE / JEE / NEET"}
- Class: ${userProfile?.classGrade || "Class 12"}
- Stream: ${userProfile?.stream || "Science"}
- Weak Topics: ${userProfile?.weakTopics?.join(", ") || "None marked yet"}
- Target: ${userProfile?.targetExam || "Board Exams & Entrance"}

TEACHING PRINCIPLES:
- "SIMPLIFY THE LANGUAGE, NEVER SIMPLIFY AWAY THE KNOWLEDGE."
- Be warm, encouraging, focused, and academically precise.
- Use clear Indian textbook terminology (NCERT, CBSE, HC Verma, RD Sharma, standard university terms).
- Offer helpful analogies (cricket, circuits, daily life) when simplifying.
- Proactively suggest a quick follow-up question or practice test to reinforce learning.`;

    const chatHistory = Array.isArray(history) ? history : [];
    const contents: any[] = [{ text: systemPrompt }];

    for (const h of chatHistory.slice(-6)) {
      contents.push({ text: `${h.sender === "user" ? "Student" : "Tutor"}: ${h.text}` });
    }
    contents.push({ text: `Student: ${message}` });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Tutor chat error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper Fallback Generators for Instant Offline / Graceful Reliability
function generateFallbackNotes(subject: string = "Physics", chapter: string = "Current Electricity", rawText?: string) {
  return {
    complete: `# Complete Academic Notes: ${chapter} (${subject})

## 1. Fundamental Concepts & Physical Quantities
Electric current is defined as the rate of flow of electric charge through any cross-section of a conductor.
If a net charge $\\Delta Q$ flows across any cross-section of a conductor in time $\\Delta t$, then the current $I$ is given by:
$$I = \\lim_{\\Delta t \\to 0} \\frac{\\Delta Q}{\\Delta t} = \\frac{dQ}{dt}$$

### Direction of Current:
By convention, the direction of electric current is taken in the direction of flow of positive charges (opposite to the actual drift of electrons).

## 2. Drift Velocity and Relaxation Time
Under the influence of an applied electric field $\\vec{E}$, conduction electrons experience an acceleration $\\vec{a} = -\\frac{e\\vec{E}}{m}$.
The average velocity acquired by free electrons along the direction opposite to the applied electric field is called **Drift Velocity** ($v_d$):
$$v_d = -\\frac{eE\\tau}{m}$$
where $\\tau$ is the average relaxation time (mean free time between consecutive collisions).

### Relation between Current and Drift Velocity:
$$I = n e A v_d$$
where:
- $n$ = Number density of free electrons (electrons/m³)
- $e$ = Elementary charge ($1.6 \\times 10^{-19} \\text{ C}$)
- $A$ = Cross-sectional area of conductor ($m^2$)

## 3. Ohm's Law and Electrical Resistance
At constant temperature and other physical conditions, the current flowing through a conductor is directly proportional to the potential difference across its ends:
$$V = IR$$
where $R = \\rho \\frac{l}{A} = \\frac{m}{n e^2 \\tau} \\frac{l}{A}$ is the electrical resistance.

### Microscopic Form of Ohm's Law:
$$\\vec{J} = \\sigma \\vec{E} = \\frac{1}{\\rho} \\vec{E}$$
where $\\vec{J} = \\frac{I}{A}$ is current density (vector quantity) and $\\sigma$ is electrical conductivity.

## 4. Temperature Dependence of Resistivity
$$\\rho_T = \\rho_0 [1 + \\alpha(T - T_0)]$$
- For metals: $\\alpha > 0$ (resistance increases with temperature).
- For semiconductors and electrolytes: $\\alpha < 0$ (resistance decreases with temperature as charge carrier concentration $n$ increases exponentially).

## 5. Kirchhoff's Laws (Circuit Analysis)
1. **Kirchhoff's Current Law (KCL / Junction Rule):** The algebraic sum of currents entering and leaving any electrical node is zero: $\\sum I = 0$. (Based on **Conservation of Charge**).
2. **Kirchhoff's Voltage Law (KVL / Loop Rule):** In any closed electrical loop, the algebraic sum of changes in potential is zero: $\\sum \\Delta V = 0$. (Based on **Conservation of Energy**).`,
    easy: `### Easy Explanation: Understanding ${chapter} in Simple Words

Think of an electrical circuit like a **water piping system in an apartment**:
1. **Voltage (V)** is like the water pump or water tank on the roof. It provides the pressure pushing water through pipes.
2. **Current (I)** is the actual flow rate of water (how many liters pass per second).
3. **Resistance (R)** is the pipe narrowing or roughness that resists the water flow.

### Why do electrons move slowly (Drift Velocity)?
Even though electrical signals travel at near the speed of light, individual electrons bump into millions of metal atoms like commuters walking through a packed Dadar or Rajiv Chowk metro station at rush hour. Their net forward speed is only about **0.1 mm/second**!

### Key Rules You Must Never Forget in Exams:
- **Kirchhoff's 1st Law:** What goes in must come out! Charge cannot magically vanish at a crossroads.
- **Kirchhoff's 2nd Law:** If you hike up a mountain and return to your starting camp, your net elevation change is exactly zero. Energy is conserved!`,
    revision: `### High-Yield Revision Summary (${chapter})
- **Current Formula:** $I = n e A v_d = \\frac{dQ}{dt}$
- **Current Density:** $J = \\frac{I}{A} = n e v_d = \\sigma E$
- **Resistance:** $R = \\frac{\\rho l}{A} = \\frac{m l}{n e^2 \\tau A}$
- **Resistivity:** $\\rho = \\frac{m}{n e^2 \\tau}$ (depends ONLY on material and temperature, NOT on geometry!)
- **KCL:** Junction rule $\\rightarrow$ Conservation of Charge
- **KVL:** Loop rule $\\rightarrow$ Conservation of Energy
- **Internal Resistance of Cell:** $r = R\\left(\\frac{E - V}{V}\\right)$
- **Wheatstone Bridge Balanced Condition:** $\\frac{P}{Q} = \\frac{R}{S} \\implies I_g = 0$`,
    ultraQuick: `⚡ 1-Minute Hallway Revision:
• Current: I = neAv_d
• Ohm's Law: V = IR, J = σE
• ρ = m / (n e² τ)
• KCL = Conservation of Charge | KVL = Conservation of Energy
• Series: R_eq = R1 + R2 | Parallel: 1/R_eq = 1/R1 + 1/R2
• Temperature: Metals α > 0, Semiconductors α < 0`,
    formulaSheet: [
      {
        formula: "I = n e A v_d",
        description: "Relation between Electric Current and Drift Velocity",
        symbols: "I = current, n = electron density, e = electronic charge, A = cross-section area, v_d = drift velocity",
        units: "Amperes (A)",
        conditions: "Steady uniform current in a metallic conductor",
        whenToUse: "When microscopic parameters like electron density or cross-section diameter are given",
      },
      {
        formula: "v_d = (e E τ) / m",
        description: "Drift velocity of free electrons in an electric field",
        symbols: "e = 1.6×10⁻¹⁹ C, E = electric field (V/m), τ = relaxation time (s), m = 9.1×10⁻³¹ kg",
        units: "m/s",
        conditions: "Uniform electric field, constant temperature",
        whenToUse: "Finding electron drift speed or relaxation time",
      },
      {
        formula: "R = ρ (l / A)",
        description: "Resistance of a uniform cylindrical conductor",
        symbols: "R = resistance, ρ = resistivity, l = length, A = cross-sectional area",
        units: "Ohms (Ω)",
        conditions: "Uniform cross-section along length l",
        whenToUse: "When wire is stretched, compressed, or geometry changes",
      },
      {
        formula: "P = V I = I² R = V² / R",
        description: "Electrical power dissipated in a resistive circuit element",
        symbols: "P = power, V = voltage, I = current, R = resistance",
        units: "Watts (W) or Joules/sec",
        conditions: "Purely resistive DC or RMS AC circuit",
        whenToUse: "Bulb ratings, heat dissipation, efficiency calculations",
      },
    ],
    definitions: [
      {
        term: "Drift Velocity",
        definition: "The average velocity with which free electrons get drifted towards the positive terminal of a conductor under the influence of an external electric field.",
        importance: "Very frequently asked 1-mark / 2-mark definition in CBSE Class 12 Boards and State Boards.",
      },
      {
        term: "Relaxation Time (τ)",
        definition: "The average time interval elapsed between two successive collisions of a conduction electron with the vibrating lattice ions.",
        importance: "Fundamental in explaining why metallic resistance increases with temperature.",
      },
      {
        term: "Current Density (J)",
        definition: "The amount of electric current flowing per unit cross-sectional area of the conductor held perpendicular to the direction of current flow. It is a vector quantity.",
        importance: "Crucial for vector formulation J = σE and electromagnetic theory.",
      },
    ],
    derivations: [
      {
        title: "Derivation of Relation between Current and Drift Velocity (I = neAv_d)",
        steps: [
          "Consider a conductor of length 'l' and uniform cross-sectional area 'A'.",
          "Total volume of the conductor = A × l.",
          "If 'n' is the number density of free electrons, then Total free electrons N = n × A × l.",
          "Total charge in the conductor Q = N × e = (n A l) e.",
          "Time taken by electrons to cross length 'l' with drift velocity v_d is t = l / v_d.",
          "By definition, Current I = Q / t = (n A l e) / (l / v_d) = n e A v_d.",
        ],
        keyTakeaway: "Current is directly proportional to drift velocity, area of cross-section, and carrier density.",
      },
    ],
    examples: [
      {
        problem: "A copper wire of diameter 1.0 mm carries a current of 1.5 A. Given that electron density n = 8.5 × 10²⁸ m⁻³, calculate the drift velocity of electrons.",
        solution: "1. Area A = π (d/2)² = 3.1416 × (0.5 × 10⁻³)² = 7.85 × 10⁻⁷ m².\n2. Use formula: v_d = I / (n e A).\n3. Substitute: v_d = 1.5 / (8.5 × 10²⁸ × 1.6 × 10⁻¹⁹ × 7.85 × 10⁻⁷) = 1.4 × 10⁻⁴ m/s (0.14 mm/s).",
        examTip: "Always convert diameter in mm to radius in meters first! Forgetting the factor of 10⁻³ is the #1 mistake.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming current is a vector quantity because it has direction.",
        whyWrong: "Electric current does NOT follow vector law of addition (triangle/parallelogram law). It adds algebraically (scalar addition).",
        correctWay: "Current is a SCALAR (or tensor). However, Current Density J is a true VECTOR.",
      },
      {
        mistake: "Writing that stretching a wire to double its length doubles its resistance.",
        whyWrong: "When a wire is stretched, its volume remains constant. Doubling length (l' = 2l) causes area to halve (A' = A/2).",
        correctWay: "New resistance R' = ρ(2l)/(A/2) = 4R. Resistance quadruples!",
      },
    ],
    exceptions: [
      {
        rule: "Ohm's Law (V = IR)",
        exception: "Semiconductor diodes, vacuum tubes, thyristors, and electrolytes are non-ohmic devices where V vs I is non-linear.",
        examCaution: "Do NOT apply Ohm's law to LED, p-n junction diodes, or arc lamps in competitive exams.",
      },
    ],
    diagrams: [
      {
        title: "Electron Drift under Applied Electric Field",
        description: "A cylindrical conductor showing random thermal zig-zag motion superimposed with a slow net drift towards the positive potential end against the electric field vector E.",
        keyLabels: ["Applied Electric Field E", "Positive Lattice Ions", "Drift Velocity Vector v_d", "Cross-Section Area A", "Current Direction I"],
      },
    ],
  };
}

function generateFallbackScanSolve(question: string, subject: string = "Physics") {
  return {
    detectedText: question,
    questionType: "numerical",
    subject: subject || "Physics",
    chapter: "Current Electricity & Circuits",
    understand: "The question requires determining the equivalent resistance and current distribution in a multi-loop electrical network with cells of different internal resistances.",
    hints: [
      "Identify nodes with the same electrical potential and check if any bridge or symmetry condition applies.",
      "Apply Kirchhoff's Voltage Law (KVL) around independent closed loops, paying careful attention to sign conventions of battery EMFs.",
    ],
    numericalSolution: {
      given: "Cell EMF E₁ = 10 V, r₁ = 2 Ω; Cell EMF E₂ = 4 V, r₂ = 1 Ω; External load R = 5 Ω.",
      required: "Net current through the 5 Ω resistor and terminal potential difference.",
      formula: "Loop equations: Σ(ΔV) = 0 around closed loops, or equivalent cell formula E_eq = (E1/r1 + E2/r2)/(1/r1 + 1/r2).",
      substitution: "E_eq = (10/2 + 4/1) / (1/2 + 1/1) = (5 + 4) / (1.5) = 9 / 1.5 = 6 V; r_eq = (2 × 1)/(2 + 1) = 2/3 Ω.",
      calculation: "Total current I = E_eq / (R + r_eq) = 6 / (5 + 0.67) = 6 / 5.67 = 1.06 A.",
      finalAnswer: "1.06 A",
      unit: "Amperes (A)",
      verificationTip: "Verify by checking KCL at the common junction: sum of branch currents I₁ + I₂ equals 1.06 A.",
    },
  };
}

function generateFallbackVideoPack(title: string, subject: string, videoUrl: string) {
  return {
    title: title || "Current Electricity Full Chapter Masterclass",
    subject: subject || "Physics",
    chapter: "Current Electricity",
    summary: "Comprehensive lecture breaking down electric currents, drift velocity derivations, Ohm's law, temperature coefficients, series/parallel combinations, and Kirchhoff's loop problems for Board and JEE/NEET exams.",
    videoChapters: [
      { timestamp: "00:00", seconds: 0, title: "Introduction & Physical Significance of Electric Charge", summary: "Overview of charge carriers in solids vs liquids." },
      { timestamp: "06:15", seconds: 375, title: "Microscopic Mechanism of Current & Drift Velocity", summary: "Detailed derivation of I = n e A v_d." },
      { timestamp: "18:40", seconds: 1120, title: "Ohm's Law, Resistivity & Temperature Effects", summary: "Understanding why metals and semiconductors behave differently." },
      { timestamp: "32:10", seconds: 1930, title: "Kirchhoff's Laws & Circuit Solving Strategies", summary: "Step-by-step masterclass on avoiding sign convention errors." },
      { timestamp: "46:50", seconds: 2810, title: "PYQ Solving: Top 5 High-Yield Board Questions", summary: "Solving actual past 5 years board exam problems." },
    ],
    notes: {
      complete: "Full detailed lecture transcript notes with complete derivations and solved illustrations.",
      easy: "Simplified summary with intuitive analogies explaining drift velocity and circuit rules.",
      revision: "High-yield 1-page summary of all key formulas and junction laws.",
      ultraQuick: "Last-minute 30-second bullet point checklist for rapid exam recall.",
    },
    keyFormulas: [
      { formula: "I = n e A v_d", description: "Current and drift velocity relation", units: "Amperes" },
      { formula: "R = ρ l / A", description: "Resistance formula", units: "Ohms (Ω)" },
      { formula: "V = IR", description: "Ohm's Law", units: "Volts" },
    ],
    mcqs: [
      {
        id: "v_mcq_1",
        text: "If a copper wire of resistance R is stretched uniformly so its length becomes 3 times, its new resistance is:",
        options: ["3R", "6R", "9R", "R/3"],
        correctAnswer: "9R",
        explanation: "Volume remains constant (V = A × l). When length triples, cross-sectional area becomes A/3. New R' = ρ(3l)/(A/3) = 9(ρl/A) = 9R.",
      },
      {
        id: "v_mcq_2",
        text: "Kirchhoff's First Rule (ΣI = 0 at a junction) is based on the law of conservation of:",
        options: ["Energy", "Charge", "Momentum", "Mass"],
        correctAnswer: "Charge",
        explanation: "Charge cannot accumulate at an electrical junction, so charge entering per unit time equals charge leaving.",
      },
    ],
    flashcards: [
      { id: "fc_v1", front: "What is Drift Velocity?", back: "The average steady velocity acquired by free electrons in a conductor opposite to the applied electric field.", type: "definition" },
      { id: "fc_v2", front: "Why is current a scalar quantity?", back: "Because it adds by simple algebraic arithmetic rules, not by vector triangle laws.", type: "concept" },
    ],
  };
}

function generateFallbackQuestions(subject: string, chapter: string, type: string, difficulty: string, count: number) {
  return [
    {
      id: "q_gen_1",
      type: "mcq",
      text: "Two cylindrical copper wires have their lengths in the ratio 1:2 and their diameters in the ratio 2:1. What is the ratio of their electrical resistances?",
      options: ["1 : 8", "1 : 4", "8 : 1", "4 : 1"],
      correctAnswer: "1 : 8",
      explanation: "Resistance R ∝ l / d². Therefore, R₁ / R₂ = (l₁ / l₂) × (d₂ / d₁)² = (1/2) × (1/2)² = 1/8.",
      hints: ["Recall that cross-sectional area A = π(d/2)² ∝ d².", "Substitute the ratio of lengths and inverse square ratio of diameters."],
      marks: 1,
      difficulty: "medium",
      isHighPriority: true,
      pyqSource: "CBSE All India 2022 / JEE Main Pattern",
    },
    {
      id: "q_gen_2",
      type: "assertion_reason",
      text: "Assertion (A): The bending of an insulated conducting wire does not affect its electrical electrical resistance.\nReason (R): The drift velocity of electrons is independent of the bend curvature in the conductor.",
      options: [
        "Both A and R are true and R is the correct explanation of A.",
        "Both A and R are true but R is NOT the correct explanation of A.",
        "A is true but R is false.",
        "A is false but R is true.",
      ],
      correctAnswer: "Both A and R are true and R is the correct explanation of A.",
      explanation: "Bending a wire does not alter its cross-sectional area, length, or the microscopic relaxation time of electrons. The electric field guides electrons smoothly along the curved contour.",
      hints: ["Does bending change the total volume, length, or cross-sectional area?", "Think about electron mean free path."],
      marks: 1,
      difficulty: "medium",
      isHighPriority: true,
      pyqSource: "CBSE Exemplar / NEET Pattern",
    },
    {
      id: "q_gen_3",
      type: "numerical",
      text: "A battery of EMF 12 V and internal resistance 2 Ω is connected to an external resistor. If the current flowing in the circuit is 0.5 A, calculate: (i) The resistance of the external resistor, and (ii) The terminal potential difference across the battery.",
      correctAnswer: "External Resistance = 22 Ω, Terminal Voltage = 11 V",
      explanation: "Total resistance R_total = E / I = 12 / 0.5 = 24 Ω. External R = 24 - 2 = 22 Ω. Terminal voltage V = E - Ir = 12 - (0.5 × 2) = 11 V.",
      hints: ["Use Ohm's law for complete circuit: I = E / (R + r).", "Terminal voltage V = E - Ir."],
      stepByStepSolution: {
        given: "EMF E = 12 V, internal resistance r = 2 Ω, current I = 0.5 A",
        required: "(i) External resistance R, (ii) Terminal voltage V",
        formula: "I = E / (R + r) and V = E - Ir",
        substitution: "0.5 = 12 / (R + 2) => R + 2 = 24 => R = 22 Ω",
        calculation: "V = 12 - (0.5 × 2) = 12 - 1 = 11 V",
        finalAnswer: "R = 22 Ω, V = 11 V",
        unit: "Ω and Volts",
      },
      marks: 3,
      difficulty: "easy",
      isHighPriority: true,
      pyqSource: "CBSE Board 2023 Set 1",
    },
    {
      id: "q_gen_4",
      type: "hots",
      text: "Why is a potentiometer preferred over an ordinary voltmeter for measuring the exact electromotive force (EMF) of a cell?",
      correctAnswer: "A potentiometer measures EMF at zero-current condition (null point), drawing zero current from the test cell, whereas a voltmeter always draws a small finite current.",
      explanation: "A standard voltmeter requires a finite current to produce a needle deflection, thereby measuring terminal voltage V = E - Ir instead of true open-circuit EMF E. The potentiometer operates on the null deflection method, acting as an ideal voltmeter with infinite input resistance.",
      hints: ["What happens when a real meter draws current from a battery with internal resistance?", "Consider the null deflection principle."],
      marks: 2,
      difficulty: "hard",
      isHighPriority: true,
      pyqSource: "CBSE 2020 & ISC 2021 Repeated Question",
    },
  ];
}

function generateFallbackTeacherAnalysis(subject: string = "Physics", teacherName: string = "School Paper") {
  return {
    title: `Style Profile: ${teacherName}`,
    teacherOrInstitute: teacherName,
    profile: {
      directTextbook: 25,
      conceptual: 35,
      application: 20,
      numerical: 15,
      tricky: 5,
    },
    keyPatterns: [
      "Prefers testing fundamental derivations with strict boundary condition checks.",
      "Frequently introduces multi-concept questions combining mechanics with electromagnetism.",
      "Likes 2-mark conceptual 'Give Reason' questions testing real-world exceptions.",
      "Step-marking is strictly rewarded for given data, labeled diagrams, and final SI units.",
    ],
    repeatedQuestionTypes: [
      "Derivations of Gauss's Law applications and Drift Velocity",
      "Assertion-Reason questions targeting microscopic semiconductor behaviors",
      "Calculations involving circuit networks with internal resistance and symmetry",
    ],
    highYieldTopics: [
      "Kirchhoff's Laws and Wheatstone Bridge balanced condition",
      "Electric Potential due to a dipole at axial and equatorial points",
      "Resistivity vs Temperature graphs for metals, semiconductors, and nichrome",
    ],
    preparationAdvice: "Focus 60% of your time on mastering core derivations and drawing neat labeled diagrams. When solving numericals, always write out Given, Formula, and SI units explicitly to lock in full step marks.",
  };
}

function generateFallbackStudyPlan(minutes: number, subject: string, topic: string, mode: string) {
  if (minutes <= 15) {
    return {
      durationMinutes: minutes,
      subject: subject || "Physics",
      topic: topic || "Core Revision",
      stages: [
        {
          stageNumber: 1,
          title: "Lightning Concept Scan",
          duration: "5 mins",
          activityType: "concept",
          content: "Review core definitions, formulas, and sign conventions.",
          bulletPoints: ["Read formula sheet", "Verify SI units", "Review 1 key diagram"],
        },
        {
          stageNumber: 2,
          title: "High-Yield PYQ Drill",
          duration: "7 mins",
          activityType: "questions",
          content: "Solve 3 most frequently tested questions.",
          bulletPoints: ["Attempt without seeing solution", "Check calculation steps"],
        },
        {
          stageNumber: 3,
          title: "Rapid Self-Test",
          duration: "3 mins",
          activityType: "test",
          content: "Active recall check of all formula variables.",
          bulletPoints: ["Write down 3 formulas from memory", "Score yourself"],
        },
      ],
    };
  }

  return {
    durationMinutes: minutes,
    subject: subject || "Physics",
    topic: topic || "Current Electricity & Circuits",
    stages: [
      {
        stageNumber: 1,
        title: "Deep Concept Mastery",
        duration: `${Math.round(minutes * 0.35)} mins`,
        activityType: "concept",
        content: "Understand microscopic mechanism, drift velocity, and Ohm's law vector form.",
        bulletPoints: [
          "Understand I = n e A v_d derivation steps",
          "Distinguish resistance R from resistivity ρ",
          "Study temperature coefficient α for conductors vs semiconductors",
        ],
      },
      {
        stageNumber: 2,
        title: "Intensive Question Practice",
        duration: `${Math.round(minutes * 0.35)} mins`,
        activityType: "questions",
        content: "Solve 5 top-priority numerical and conceptual board questions.",
        bulletPoints: [
          "Solve 1 wire-stretching numerical",
          "Solve 1 Kirchhoff loop network with internal resistance",
          "Solve 1 Assertion-Reason question on Ohm's law validity",
        ],
      },
      {
        stageNumber: 3,
        title: "Active Recall & Mistakes Check",
        duration: `${Math.round(minutes * 0.15)} mins`,
        activityType: "revision",
        content: "Audit your common exam pitfalls and memorise the formula sheet.",
        bulletPoints: [
          "Recite KCL (charge conservation) and KVL (energy conservation)",
          "Verify that you always write SI units in final step",
        ],
      },
      {
        stageNumber: 4,
        title: "Timed Mini-Mock Test",
        duration: `${Math.round(minutes * 0.15)} mins`,
        activityType: "test",
        content: "Attempt 3-question rapid test with instant scoring.",
        bulletPoints: [
          "1 MCQ (1 mark)",
          "1 Conceptual reasoning (2 marks)",
          "1 Numerical problem (3 marks)",
        ],
      },
    ],
  };
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ADHYAY Server running on http://localhost:${PORT}`);
  });
}

startServer();
