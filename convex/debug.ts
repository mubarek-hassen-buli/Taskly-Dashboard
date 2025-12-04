import { query } from "./_generated/server";

export const inspectEnv = query({
  args: {},
  handler: async () => {
    const key = process.env.JWT_PRIVATE_KEY || "";
    return {
      length: key.length,
      first100: key.substring(0, 100),
      hasLiteralBackslashN: key.includes("\\n"),
      hasRealNewline: key.includes("\n"),
      // Check if it starts with backslash
      startsWithBackslash: key.startsWith("\\"),
    };
  },
});
