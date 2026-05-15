import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI-powered insights for premium users
  insights: router({
    generateCorrelations: publicProcedure
      .input(
        z.object({
          metrics: z.array(
            z.object({
              name: z.string(),
              values: z.array(z.number()),
              average: z.number(),
            })
          ),
          isPremium: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        if (!input.isPremium) {
          return {
            insights: [],
            message: "Upgrade to premium to unlock correlation analysis",
          };
        }

        try {
          const metricsDescription = input.metrics
            .map(
              (m) =>
                `${m.name}: average ${m.average.toFixed(1)}, values [${m.values
                  .slice(0, 7)
                  .map((v) => v.toFixed(1))
                  .join(", ")}]`
            )
            .join("\n");

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are a wellness data analyst. Analyze the provided metrics and identify meaningful correlations and patterns. Provide 2-3 specific, actionable insights based on the data. Focus on practical recommendations.",
              },
              {
                role: "user",
                content: `Analyze these wellbeing metrics and identify correlations:\n\n${metricsDescription}\n\nProvide insights in a brief, conversational tone.`,
              },
            ],
          });

          const content =
            response.choices[0]?.message?.content || "No insights generated";
          const insights = (typeof content === "string" ? content : "").split(
            "\n"
          );

          return {
            insights: insights.filter((i) => i.trim().length > 0),
            message: "Insights generated successfully",
          };
        } catch (error) {
          console.error("Error generating insights:", error);
          return {
            insights: [],
            message: "Failed to generate insights. Please try again.",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
