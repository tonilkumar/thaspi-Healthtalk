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
    const userQuery = (lastMsgObj?.text || '').trim();
    const lowerQuery = userQuery.toLowerCase();
    const effectiveName = userName || 'friend';

    // Helper to determine suggested coping activity
    const detectActivity = (text: string) => {
      const t = text.toLowerCase();
      if (t.includes('breath') || t.includes('panic') || t.includes('anxi') || t.includes('heart') || t.includes('chest')) {
        return { activity: 'Box Breathing (4-4-4-4)', category: 'Stress' };
      }
      if (t.includes('spiral') || t.includes('overthink') || t.includes('mind') || t.includes('racing') || t.includes('loop')) {
        return { activity: '5-4-3-2-1 Sensory Grounding', category: 'Overthinking' };
      }
      if (t.includes('procrastinat') || t.includes('motivat') || t.includes('lazy') || t.includes('start') || t.includes('tired')) {
        return { activity: 'Five-Minute Action Rule', category: 'Low motivation' };
      }
      if (t.includes('exam') || t.includes('paper') || t.includes('assign') || t.includes('grade') || t.includes('study') || t.includes('class')) {
        return { activity: 'Micro-Step Task Breakdown', category: 'Academic pressure' };
      }
      if (t.includes('scroll') || t.includes('phone') || t.includes('screen') || t.includes('tiktok') || t.includes('instagram')) {
        return { activity: 'Mindful Swap & Digital Unplug', category: 'Excessive scrolling' };
      }
      if (t.includes('lone') || t.includes('isolate') || t.includes('friend') || t.includes('talk') || t.includes('miss')) {
        return { activity: 'Caring Connection Bridge', category: 'Loneliness' };
      }
      return { activity: 'Box Breathing (4-4-4-4)', category: 'Stress' };
    };

    const suggested = detectActivity(userQuery);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackReply = `I hear you, ${effectiveName}. Academic deadlines and daily pressures can feel like a heavy weight pressing on your chest. You are allowed to take a pause right now. Your worth is never defined by a single exam or assignment. Would it help if we broke this down together into one tiny, manageable step?`;
      return res.status(200).json({
        reply: fallbackReply,
        suggestedActivity: suggested.activity,
        suggestedCategory: suggested.category,
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
The user's name is "${effectiveName}" and their recent logged mood is "${userMood || 'Not specified'}".

Your guidelines:
1. Tone: Warm, validating, grounded, gentle, and conversational.
2. Structure: 2-3 short, digestible paragraphs.
3. Validate: Acknowledge and normalize their feelings first.
4. Follow-up: Ask at most ONE thoughtful, gentle follow-up question.
5. Coping: Suggest a practical, zero-pressure technique.
6. Non-clinical: You are an emotional wellness peer, NOT a doctor or therapist. Never diagnose or prescribe.
7. Crisis Protocol: If the user indicates self-harm or severe crisis, immediately provide 988 Lifeline and Crisis Text Line (HOME to 741741) with warmth.`;

    const formattedContents = messages.map((m: { sender: string; text: string }) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 5000)
    );

    let reply = '';
    try {
      const result: any = await Promise.race([generatePromise, timeoutPromise]);
      reply = result?.text?.trim() || '';
    } catch (apiErr: any) {
      console.warn('Vercel Gemini API call timed out or failed, using responsive fallback:', apiErr?.message);
    }

    if (!reply) {
      if (lowerQuery.includes('paper') || lowerQuery.includes('exam') || lowerQuery.includes('deadline') || lowerQuery.includes('paralyz')) {
        reply = `I completely understand that feeling of paralysis, ${effectiveName}. When deadlines pile up, our nervous system treats it like an emergency, causing us to freeze. \n\nFirst, take a slow breath with me. You don't have to tackle the whole mountain this second. Can we pick just one tiny part—like writing down 3 rough bullet points for just 5 minutes? How does that feel?`;
      } else if (lowerQuery.includes('overthink') || lowerQuery.includes('racing') || lowerQuery.includes('spiral')) {
        reply = `It sounds like your mind is running in overdrive right now, ${effectiveName}. Overthinking often happens when our brain is trying too hard to protect us from uncertainty.\n\nLet's pull your awareness gently back into the room. Feel your feet resting on the ground, and notice one physical object near you. What color is it?`;
      } else if (lowerQuery.includes('lone') || lowerQuery.includes('isolate') || lowerQuery.includes('alone')) {
        reply = `Loneliness can feel surprisingly physical, ${effectiveName}, especially in college when everyone else seems like they have it all figured out. \n\nI want to remind you that needing connection is deeply human. Even reaching out with a simple "thinking of you" text to an old friend can create a little bridge of warmth. Who is one person you feel comfortable saying hi to?`;
      } else {
        reply = `Thank you for sharing that with me, ${effectiveName}. It takes courage to put your thoughts into words. I'm right here with you, and there's no pressure to have everything figured out right now. What is one small thing that could bring 1% more ease to your day?`;
      }
    }

    return res.status(200).json({
      reply,
      suggestedActivity: suggested.activity,
      suggestedCategory: suggested.category,
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
