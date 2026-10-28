/** Shared marketing copy for auth screens (aligned with Simply Code LLC). */
export const authMarketingCopy = {
  headline: "Simplify the process. Supercharge the results.",
  subline:
    "Focus on the big picture while we build reliable, modern software for the web.",
} as const;

export const authPageCopy = {
  login: {
    title: "Log in to your account",
    description: `Welcome back to Simply Code LLC. ${authMarketingCopy.subline}`,
    footerPrompt: "Don't have an account?",
    footerLink: "Create one",
  },
  register: {
    title: "Create your account",
    description: `${authMarketingCopy.headline} ${authMarketingCopy.subline}`,
    footerPrompt: "Already have an account?",
    footerLink: "Sign in",
  },
} as const;
