export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    appName: 'HealPath',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
