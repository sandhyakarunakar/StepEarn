import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

// Helper to parse JSON body
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

const MILESTONE_AWARDS: Record<number, number> = {
  1000: 1, 2000: 1, 3000: 1, 4000: 1, 5000: 1,
  6000: 1, 7000: 1, 8000: 1, 9000: 2, 10000: 1,
  11000: 2, 12000: 1, 13000: 2, 14000: 1, 15000: 2,
  16000: 1, 17000: 1, 18000: 1, 19000: 1, 20000: 2,
};

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';

  if (!url.startsWith('/api/')) {
    return false;
  }

  try {
    if (url === '/api/chat' && req.method === 'POST') {
      const { messages, userContext } = await parseBody(req);
      const ai = new GoogleGenAI();

      const systemInstruction = `You are StepEarn Coach, a friendly walking and fitness assistant embedded inside the StepEarn app. You ONLY answer questions related to: walking, step counts, daily step goals, general fitness/exercise tips, calories burned from walking, stretching/warm-ups for walking, posture and footwear for walking, motivation for building a walking habit, and how the StepEarn app's coin/reward/step-conversion system works. If the user asks about anything outside these topics, politely decline and redirect them back to walking/fitness topics in one short sentence. Keep answers concise, encouraging, and mobile-friendly. Never give specific medical diagnoses — for injuries or medical concerns, advise seeing a doctor.
Current user live context:
- User name: ${userContext?.userName || 'Walker'}
- Steps today: ${userContext?.stepsToday?.toLocaleString() || 0}
- Distance today: ${userContext?.distanceKm || 0} km
- Estimated calories burned: ${userContext?.caloriesBurned || 0} kcal
- Daily goal: 20,000 steps (${Math.max(0, 20000 - (userContext?.stepsToday || 0)).toLocaleString()} steps remaining)
- Daily streak: ${userContext?.streak || 0} days
- Coin Balance: ${(userContext?.coinBalance || 0).toLocaleString()} StepEarn Coins
- Rank among friends: ${userContext?.rank || 'Active Walker'}`;

      const contents = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Always fallback to friendly response if key is missing or quota is limited
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 350,
          },
        });

        sendJson(res, 200, { reply: response.text });
      } catch (err: any) {
        console.warn('Gemini API call returned error, using smart fitness coach fallback:', err?.message);
        
        // Smart fallback rule-based response matching the persona
        const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
        let fallback = "Every step counts towards your fitness and rewards! Keep moving, stay hydrated, and remember to stretch.";

        if (lastMsg.includes('calorie') || lastMsg.includes('burn')) {
          fallback = `Based on your ${userContext?.stepsToday?.toLocaleString() || 4450} steps today, you've burned roughly ${Math.round((userContext?.stepsToday || 4450) * 0.045)} kcal! A brisk 30-minute walk burns around 150-200 calories depending on pace and terrain.`;
        } else if (lastMsg.includes('stretch') || lastMsg.includes('warm')) {
          fallback = "Here is a quick 3-minute walking stretch routine:\n1. Calf Wall Stretch (30s each leg)\n2. Standing Quad Pull (30s each leg)\n3. Ankle Circles (10 inward, 10 outward)\n4. Hamstring Toe Sweep (10 reps). Always warm up before brisk walks!";
        } else if (lastMsg.includes('coin') || lastMsg.includes('earn') || lastMsg.includes('reward')) {
          fallback = "In StepEarn, you earn coins at every 1,000-step milestone up to 20,000 steps daily (totaling 25 coins!). Remember to tap glowing markers on your gauge to claim them, or hit 'Convert my steps' before midnight.";
        } else if (lastMsg.includes('motivat') || lastMsg.includes('tired')) {
          fallback = `You're currently on an amazing ${userContext?.streak || 3}-day streak! Lace up your sneakers for just 10 minutes—action creates motivation, and your next milestone marker is waiting!`;
        } else if (lastMsg.includes('shoe') || lastMsg.includes('posture') || lastMsg.includes('footwear')) {
          fallback = "For optimal walking: keep your head upright, shoulders relaxed and back, swing your arms naturally at 90°, and land gently heel-to-toe. Look for shoes with good arch support and cushioned heels!";
        }

        sendJson(res, 200, { reply: fallback });
      }
      return true;
    }

    if (url === '/api/functions/claimStepMilestone' && req.method === 'POST') {
      const { stepThreshold } = await parseBody(req);
      const coinReward = MILESTONE_AWARDS[stepThreshold] || 1;
      sendJson(res, 200, {
        success: true,
        coinsAwarded: coinReward,
        milestone: stepThreshold,
      });
      return true;
    }

    if (url === '/api/functions/convertDailySteps' && req.method === 'POST') {
      const { eligibleMilestones } = await parseBody(req);
      const total = (eligibleMilestones || []).reduce(
        (sum: number, th: number) => sum + (MILESTONE_AWARDS[th] || 1),
        0
      );
      sendJson(res, 200, {
        success: true,
        coinsAwarded: total,
      });
      return true;
    }

    if (url === '/api/functions/awardAdReward' && req.method === 'POST') {
      sendJson(res, 200, {
        success: true,
        coinsAwarded: 10,
      });
      return true;
    }

    if (url === '/api/functions/redeemReward' && req.method === 'POST') {
      const body = await parseBody(req);
      sendJson(res, 200, {
        success: true,
        redemptionId: 'rdm_' + Math.random().toString(36).substring(2, 9),
        status: 'pending',
        payoutDetails: body.payoutDetails,
      });
      return true;
    }

    sendJson(res, 404, { error: 'Endpoint not found' });
    return true;
  } catch (err: any) {
    sendJson(res, 500, { error: err.message || 'Server error' });
    return true;
  }
}
