/**
 * Generate a weekly summary email for a user.
 * This is a placeholder implementation that generates the email HTML.
 * 
 * TODO: Integrate with actual user data from database.
 * For now, this generates a template email with sample data.
 */
export async function generateWeeklySummaryEmail(userId: string) {
  try {
    // TODO: Fetch actual user data from database
    // const user = await db.query.users.findFirst({
    //   where: eq(users.id, userId),
    // });

    // For now, use placeholder data
    const user = {
      id: userId,
      name: 'Friend',
      email: `user+${userId}@example.com`,
    };

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // TODO: Fetch actual daily and weekly entries from database
    // For now, use sample data
    const sampleData = {
      avgScore: 72,
      totalSteps: 65000,
      avgSleep: 7.2,
      completedDays: 6,
      daysTracked: 7,
      weeklyJournal: 'Great week overall. Managed to stay consistent with my morning sunlight routine and completed all my weekly habits.',
      habits: {
        connection: true,
        contribution: true,
        novelty: false,
      },
    };

    const emailHtml = buildEmailHtml({
      userName: user.name,
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      ...sampleData,
    });

    return {
      ok: true,
      email: {
        to: user.email,
        subject: `Your Weekly ThriveIndex Summary — Week of ${formatDate(weekStart)}`,
        html: emailHtml,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function buildEmailHtml(data: {
  userName: string;
  weekStart: string;
  weekEnd: string;
  avgScore: number;
  totalSteps: number;
  avgSleep: number;
  completedDays: number;
  daysTracked: number;
  weeklyJournal: string;
  habits: { connection: boolean; contribution: boolean; novelty: boolean };
}): string {
  const scoreColor = data.avgScore >= 80 ? '#22c55e' : data.avgScore >= 60 ? '#0a7ea4' : '#f59e0b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #0a7ea4 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .card h2 { margin: 0 0 15px 0; font-size: 18px; color: #0a7ea4; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .stat { background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: ${scoreColor}; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; text-transform: uppercase; }
    .habits { display: flex; gap: 10px; flex-wrap: wrap; }
    .habit { display: inline-flex; align-items: center; gap: 6px; background: #f3f4f6; padding: 8px 12px; border-radius: 20px; font-size: 14px; }
    .habit.completed { background: #dcfce7; color: #166534; }
    .journal { background: #f9fafb; border-left: 4px solid #0a7ea4; padding: 15px; border-radius: 4px; font-size: 14px; line-height: 1.8; }
    .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
    .button { display: inline-block; background: #0a7ea4; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Weekly Summary</h1>
      <p>${data.weekStart} — ${data.weekEnd}</p>
    </div>

    <div class="card">
      <h2>📊 This Week's Performance</h2>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${data.avgScore}</div>
          <div class="stat-label">Avg Daily Score</div>
        </div>
        <div class="stat">
          <div class="stat-value">${data.completedDays}/${data.daysTracked}</div>
          <div class="stat-label">Days Tracked</div>
        </div>
        <div class="stat">
          <div class="stat-value">${data.avgSleep}</div>
          <div class="stat-label">Avg Sleep (hrs)</div>
        </div>
        <div class="stat">
          <div class="stat-value">${(data.totalSteps / 1000).toFixed(1)}k</div>
          <div class="stat-label">Total Steps</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🎯 Weekly Habits</h2>
      <div class="habits">
        <div class="habit ${data.habits.connection ? 'completed' : ''}">
          ${data.habits.connection ? '✓' : '○'} Meaningful Connection
        </div>
        <div class="habit ${data.habits.contribution ? 'completed' : ''}">
          ${data.habits.contribution ? '✓' : '○'} Contribution
        </div>
        <div class="habit ${data.habits.novelty ? 'completed' : ''}">
          ${data.habits.novelty ? '✓' : '○'} Novelty
        </div>
      </div>
    </div>

    ${data.weeklyJournal ? `
    <div class="card">
      <h2>📝 Your Reflection</h2>
      <div class="journal">${escapeHtml(data.weeklyJournal)}</div>
    </div>
    ` : ''}

    <div class="card" style="text-align: center;">
      <a href="https://thriveindex.app" class="button">View Full Dashboard</a>
    </div>

    <div class="footer">
      <p>ThriveIndex — A scientifically grounded operating system for a better life.</p>
      <p>You're receiving this because you enabled weekly summaries. Manage preferences in your app settings.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
