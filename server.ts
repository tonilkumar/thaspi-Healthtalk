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

    const systemInstruction = `You are "TalkSpace", HealPath's AI emotional wellness companion for college students and young adults.
You talk like someone close to the user: a trusted, deeply empathetic, personal therapist-friend.
The HealPath core philosophy is: UNDERSTAND -> COPE -> HEAL -> GROW.
The user's name is "${effectiveName}" and their recently logged mood is "${userMood || 'Not specified'}".

YOUR PERSONALITY & CONVERSATIONAL STYLE:
1. Warm, Grounded, and Human: Talk like a deeply supportive, emotionally intelligent friend or mentor who truly cares and holds space. No robotic pleasantries, clinical checklists, or rigid boilerplate.
2. Deep Validation: Always acknowledge and gently mirror what they're carrying first ("I hear how exhausting that's been for you", "Oof, that makes so much sense given what's on your plate right now"). Make them feel genuinely seen and safe.
3. Conversational Rhythm: Keep responses natural, tender, and easy to read (1 to 3 short paragraphs). Never dump walls of text or unsolicited 5-step numbered lists.
4. One Gentle Inquiry: End with at most ONE thoughtful, non-pressuring question or soft reflection inviting them to share more.
5. Coping Practice Suggestions: If the user shares that they are feeling stressed, anxious, panicked, overwhelmed, stuck, overthinking, lonely, or exhausted—or if they ask for tools or relief—warmly offer to take a gentle pause with them and try a quick exercise. At the very end of your response, append the matching tag from the list below:
   - [SUGGEST_COPE:act-1:Box Breathing (4-4-4-4)] -> for anxiety, panic, shortness of breath, nervous tension
   - [SUGGEST_COPE:act-2:5-4-3-2-1 Sensory Grounding] -> for spiraling thoughts, overthinking, feeling disconnected
   - [SUGGEST_COPE:act-3:Five-Minute Action Rule] -> for procrastination, low motivation, task paralysis, feeling stuck
   - [SUGGEST_COPE:act-4:Micro-Step Task Breakdown] -> for academic pressure, exam panic, intimidating projects
   - [SUGGEST_COPE:act-5:Mindful Swap & Digital Unplug] -> for doomscrolling, comparison spiral, screen fatigue
   - [SUGGEST_COPE:act-6:Caring Connection Bridge] -> for loneliness, feeling invisible or disconnected
   - [SUGGEST_COPE:act-7:Mindful Body & Jaw Release] -> for physical tightness, clenched jaw, headache, shoulder tension
   - [SUGGEST_COPE:act-8:Evening Reflection & Thought Release] -> for bedtime worry, insomnia, winding down
6. Safety Protocol: You are a peer emotional companion. If the user mentions self-harm or crisis, respond with profound care and provide the 988 Suicide & Crisis Lifeline (call/text 988) and Crisis Text Line (text HOME to 741741).`;

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
      reply = `I hear you, ${effectiveName}. It takes so much strength to open up and put what you're carrying into words. I'm right here with you, and there's no rush at all. What feels like the heaviest part of this right now?`;
    }

    // Extract coping suggestion tag if returned by AI
    let suggestedActivity: string | undefined;
    let suggestedActivityId: string | undefined;
    let suggestedCategory: string | undefined;

    const copeTagRegex = /\[SUGGEST_COPE:([^:]+):([^\]]+)\]/i;
    const copeMatch = reply.match(copeTagRegex);
    if (copeMatch) {
      suggestedActivityId = copeMatch[1].trim();
      suggestedActivity = copeMatch[2].trim();
      reply = reply.replace(copeTagRegex, '').trim();
    }

    // Contextual fallback recommendation if no tag was emitted but user expressed struggle
    const lowerQuery = userQuery.toLowerCase();
    const lowerReply = reply.toLowerCase();

    if (!suggestedActivity) {
      if (
        lowerQuery.includes('anxious') ||
        lowerQuery.includes('panic') ||
        lowerQuery.includes('breathe') ||
        lowerQuery.includes('breathing') ||
        lowerQuery.includes('heart is beating') ||
        lowerQuery.includes('chest') ||
        lowerQuery.includes('stress') ||
        lowerReply.includes('breath')
      ) {
        suggestedActivityId = 'act-1';
        suggestedActivity = 'Box Breathing (4-4-4-4)';
        suggestedCategory = 'Stress';
      } else if (
        lowerQuery.includes('overthink') ||
        lowerQuery.includes('spiraling') ||
        lowerQuery.includes('my head') ||
        lowerQuery.includes('racing') ||
        lowerQuery.includes('ruminat') ||
        lowerQuery.includes('thoughts won\'t stop')
      ) {
        suggestedActivityId = 'act-2';
        suggestedActivity = '5-4-3-2-1 Sensory Grounding';
        suggestedCategory = 'Overthinking';
      } else if (
        lowerQuery.includes('procrastinat') ||
        lowerQuery.includes('lazy') ||
        lowerQuery.includes('stuck') ||
        lowerQuery.includes('motivation') ||
        lowerQuery.includes('can\'t start')
      ) {
        suggestedActivityId = 'act-3';
        suggestedActivity = 'Five-Minute Action Rule';
        suggestedCategory = 'Low motivation';
      } else if (
        lowerQuery.includes('exam') ||
        lowerQuery.includes('deadline') ||
        lowerQuery.includes('assignment') ||
        lowerQuery.includes('college') ||
        lowerQuery.includes('study') ||
        lowerQuery.includes('school') ||
        lowerQuery.includes('homework')
      ) {
        suggestedActivityId = 'act-4';
        suggestedActivity = 'Micro-Step Task Breakdown';
        suggestedCategory = 'Academic pressure';
      } else if (
        lowerQuery.includes('scroll') ||
        lowerQuery.includes('phone') ||
        lowerQuery.includes('instagram') ||
        lowerQuery.includes('tiktok') ||
        lowerQuery.includes('screen')
      ) {
        suggestedActivityId = 'act-5';
        suggestedActivity = 'Mindful Swap & Digital Unplug';
        suggestedCategory = 'Excessive scrolling';
      } else if (
        lowerQuery.includes('lonely') ||
        lowerQuery.includes('alone') ||
        lowerQuery.includes('isolated') ||
        lowerQuery.includes('no friends') ||
        lowerQuery.includes('nobody understands')
      ) {
        suggestedActivityId = 'act-6';
        suggestedActivity = 'Caring Connection Bridge';
        suggestedCategory = 'Loneliness';
      } else if (
        lowerQuery.includes('jaw') ||
        lowerQuery.includes('tension') ||
        lowerQuery.includes('headache') ||
        lowerQuery.includes('shoulders') ||
        lowerQuery.includes('tired') ||
        lowerQuery.includes('exhausted')
      ) {
        suggestedActivityId = 'act-7';
        suggestedActivity = 'Mindful Body & Jaw Release';
        suggestedCategory = 'Stress';
      }
    }

    res.json({
      reply,
      suggestedActivity,
      suggestedActivityId,
      suggestedCategory,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.json({
      reply: "I'm right here with you. Take a soft, gentle breath. Tell me what's on your heart right now—I'm listening without any judgment.",
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
