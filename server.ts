import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'HealPath',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
  });
});

// HealPath AI Conversational Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userMood, userName } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMsgObj = messages[messages.length - 1];
    const userQuery = (lastMsgObj?.text || lastMsgObj?.message || lastMsgObj?.content || '').trim();
    const effectiveName = userName || 'Friend';

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: `Hi ${effectiveName}, I'm listening with care. What you're carrying right now matters, and you don't have to face it alone. Tell me more about what's been happening today?`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "TalkSpace", HealPath's compassionate, supportive AI emotional wellness companion for college students and young adults.
The HealPath philosophy is: UNDERSTAND -> COPE -> HEAL -> GROW.
The user's name is "${effectiveName}" and their recently logged mood is "${userMood || 'Not specified'}".

CRITICAL CONVERSATIONAL GUIDELINES:
1. Authentic Conversation: Talk like a warm, deeply empathetic peer or mentor. The user came here to TEXT or TALK freely about their emotions, thoughts, worries, or triumphs.
2. Active Listening: First validate and reflect what they share so they feel deeply understood.
3. Natural Flow: Do NOT jump into robotic multi-step numbered tutorials or force 5-step exercises on them! Keep the conversation flowing naturally, like two caring friends sitting on a bench.
4. Reflective Inquiries: Ask at most ONE thoughtful, gentle open question that invites them to reflect or express how they are holding up.
5. Helpful suggestions: ONLY suggest a specific micro-technique (like 4-7-8 breathing, 5-4-3-2-1 grounding, or the 5-minute kickstart) if the user explicitly asks for coping tools or describes acute panic/hyperventilation. Otherwise, focus entirely on empathetic emotional conversation.
6. Safety Protocol: You are a peer wellness companion, not a licensed medical professional. If a user exhibits self-harm thoughts or severe crisis, immediately provide 988 Suicide & Crisis Lifeline and Crisis Text Line (HOME to 741741) with deep care.`;

    const formattedContents = messages.map((m: any) => ({
      role: (m.sender === 'user' || m.role === 'user') ? 'user' : 'model',
      parts: [{ text: m.text || m.message || m.content || '' }],
    }));

    // Allow 25 seconds for real generative response
    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 25000)
    );

    let reply = '';
    try {
      const result: any = await Promise.race([generatePromise, timeoutPromise]);
      reply = result?.text?.trim() || '';
    } catch (apiErr: any) {
      console.warn('SDK call timed out or failed, attempting direct fetch...', apiErr?.message);
      // Direct fetch fallback for guaranteed delivery
      try {
        const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const fetchRes = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: formattedContents,
          }),
        });
        if (fetchRes.ok) {
          const fetchData = await fetchRes.json();
          reply = fetchData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (fetchErr) {
        console.error('Direct fetch also failed:', fetchErr);
      }
    }

    if (!reply) {
      reply = `I hear you, ${effectiveName}. It takes real courage to open up and share what you're holding inside. I'm right here with you. What feels like the heaviest part of this right now?`;
    }

    // Only attach an interactive exercise if user explicitly asked or is in acute panic
    let suggestedActivity: string | undefined;
    let suggestedCategory: string | undefined;
    const lowerQuery = userQuery.toLowerCase();
    if (lowerQuery.includes('give me an exercise') || lowerQuery.includes('teach me to breathe') || lowerQuery.includes('can you guide me') || lowerQuery.includes('help me breathe') || lowerQuery.includes('panic attack')) {
      suggestedActivity = 'Box Breathing (4-4-4-4)';
      suggestedCategory = 'Stress';
    } else if (lowerQuery.includes('grounding technique') || lowerQuery.includes('help me ground') || lowerQuery.includes('5-4-3-2-1')) {
      suggestedActivity = '5-4-3-2-1 Sensory Grounding';
      suggestedCategory = 'Overthinking';
    }

    res.json({
      reply,
      suggestedActivity,
      suggestedCategory,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.json({
      reply: "I'm right here with you. Take a slow, gentle breath. Tell me what's on your mind, I am listening.",
    });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealPath server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
