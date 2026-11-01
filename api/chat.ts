import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

// Helper to parse JSON body for Vercel Serverless
async function parseJsonBody(req: any) {
  if (req.body) return req.body;
  return new Promise<any>((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const { messages, userMood, userName } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMsgObj = messages[messages.length - 1];
    const userQuery = (lastMsgObj?.text || lastMsgObj?.message || lastMsgObj?.content || '').trim();
    const effectiveName = userName || 'Friend';

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
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
      console.warn('Vercel Gemini API call timed out or failed, using direct fetch fallback:', apiErr?.message);
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

    return res.status(200).json({
      reply,
      suggestedActivity,
      suggestedCategory,
    });
  } catch (error: any) {
    console.error('Error in Vercel /api/chat:', error);
    return res.status(200).json({
      reply: "I'm right here with you. Take a slow, gentle breath. Remember that you are doing the best you can with what you have today.",
      suggestedActivity: 'Box Breathing (4-4-4-4)',
      suggestedCategory: 'Stress',
    });
  }
}
