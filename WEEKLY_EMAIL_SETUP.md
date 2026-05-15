# Weekly Email Setup Guide

This document explains how to set up and schedule weekly summary emails for ThriveIndex users.

## Overview

The weekly email feature generates a personalized summary of a user's wellbeing metrics and sends it via email. The email is generated on-demand by the `/api/scheduled/weekly-digest` endpoint and can be scheduled using the Manus Heartbeat cron system.

## Components

### 1. Email Generator (`server/_core/weeklyEmailGenerator.ts`)

Generates an HTML email with:
- Weekly performance metrics (average daily score, days tracked, average sleep, total steps)
- Weekly habit completion (meaningful connection, contribution, novelty)
- User's weekly journal reflection
- Call-to-action button to view full dashboard

### 2. Scheduled Handler (`server/_core/index.ts`)

Endpoint: `POST /api/scheduled/weekly-digest`

**Authentication**: Heartbeat cron only (requires `user.isCron === true` and `user.taskUid`)

**Response**:
```json
{
  "ok": true,
  "email": "Your Weekly ThriveIndex Summary — Week of Jan 15, 2026"
}
```

**Error Response** (500):
```json
{
  "error": "User not found",
  "stack": "...",
  "context": { "url": "/api/scheduled/weekly-digest", "timestamp": "..." }
}
```

## Scheduling

### Option 1: Create a Project-Level Cron (Admin)

Schedule a weekly digest for all users every Sunday at 9 AM UTC:

```bash
manus-heartbeat create \
  --name thriveindex-weekly-digest \
  --cron "0 0 9 * * 0" \
  --path /api/scheduled/weekly-digest \
  --description "Weekly ThriveIndex digest for all users"
```

This will return a `task_uid`. Save it for future updates.

### Option 2: Per-User Cron (End-User Driven)

Users can enable weekly emails via a tRPC mutation (to be implemented):

```ts
// In server/routers.ts or a new emailRouter
export const emailRouter = router({
  enableWeeklyDigest: protectedProcedure
    .input(z.object({ enableEmail: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";

      if (input.enableEmail) {
        const job = await createHeartbeatJob({
          name: `weekly-digest-${ctx.user.id}`,
          cron: "0 0 9 * * 0", // Every Sunday 9 AM UTC
          path: "/api/scheduled/weekly-digest",
          description: `Weekly digest for ${ctx.user.email}`,
        }, sessionToken);

        await db.update(users)
          .set({ weeklyEmailTaskUid: job.taskUid })
          .where(eq(users.id, ctx.user.id));
      } else {
        // Cancel existing cron
        const user = await db.query.users.findFirst({
          where: eq(users.id, ctx.user.id),
        });
        if (user?.weeklyEmailTaskUid) {
          await deleteHeartbeatJob(user.weeklyEmailTaskUid, sessionToken);
          await db.update(users)
            .set({ weeklyEmailTaskUid: null })
            .where(eq(users.id, ctx.user.id));
        }
      }

      return { ok: true };
    }),
});
```

## Email Service Integration

Currently, the handler **logs** the generated email but does not send it. To actually send emails, integrate with an email service:

### SendGrid Example

```ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const result = await generateWeeklySummaryEmail(user.id);
if (result.ok) {
  await sgMail.send({
    to: result.email.to,
    from: 'noreply@thriveindex.app',
    subject: result.email.subject,
    html: result.email.html,
  });
}
```

### AWS SES Example

```ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: process.env.AWS_REGION });

const result = await generateWeeklySummaryEmail(user.id);
if (result.ok) {
  await ses.send(new SendEmailCommand({
    Source: 'noreply@thriveindex.app',
    Destination: { ToAddresses: [result.email.to] },
    Message: {
      Subject: { Data: result.email.subject },
      Body: { Html: { Data: result.email.html } },
    },
  }));
}
```

## Database Schema

Add these columns to the `users` table to track email preferences:

```sql
ALTER TABLE users ADD COLUMN weekly_email_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN schedule_cron_task_uid VARCHAR(65);
```

## Deployment

**IMPORTANT**: The app must be deployed before scheduling crons. The Manus platform can only reach deployed URLs.

1. Save a checkpoint
2. Click **Publish** in the Management UI
3. Wait for the build to complete
4. Once deployed, create the cron using `manus-heartbeat create` or the tRPC mutation

## Testing

To test the email generation locally:

```bash
curl -X POST http://localhost:3000/api/scheduled/weekly-digest \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=<valid_token>" \
  -d '{"test": true}'
```

(Note: This will fail auth unless you mock the cron auth headers. For real testing, use `manus-heartbeat` CLI after deployment.)

## Monitoring

View cron execution logs:

```bash
manus-heartbeat logs --task-uid <task_uid> --with-body
```

View recent executions:

```bash
manus-heartbeat logs --task-uid <task_uid> --status failed
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "cron-only" error | Ensure the request includes valid cron auth headers (only Manus platform can set these) |
| "User not found" | The user ID in the cron context doesn't exist in the database |
| Email not sending | Check that email service credentials are set in environment variables |
| Cron not triggering | Verify the app is deployed and the cron is enabled (`manus-heartbeat list --task-uid <id>`) |

## Next Steps

1. **Add email service integration** (SendGrid, AWS SES, etc.)
2. **Add user preference UI** (Settings screen toggle for weekly emails)
3. **Add tRPC mutation** for per-user cron management
4. **Deploy the app** before scheduling
5. **Create the cron** using `manus-heartbeat` CLI or the tRPC mutation
