/** Editable copy for the public contact form, stored on the `contact-intro` page section. */

export type ContactFormContent = {
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  companyLabel?: string;
  companyPlaceholder?: string;
  projectTypeLabel?: string;
  projectTypePlaceholder?: string;
  projectTypeOptions?: string[];
  budgetLabel?: string;
  budgetPlaceholder?: string;
  budgetOptions?: string[];
  detailsLabel?: string;
  detailsPlaceholder?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  sendAnotherLabel?: string;
  privacyText?: string;
  privacyLinkLabel?: string;
};

export type ResolvedContactFormContent = {
  [Key in keyof Required<ContactFormContent>]: Key extends
    | "projectTypeOptions"
    | "budgetOptions"
    ? string[]
    : string;
};

export const defaultContactFormContent: ResolvedContactFormContent = {
  nameLabel: "Full Name",
  namePlaceholder: "What should we call you?",
  emailLabel: "Work Email",
  emailPlaceholder: "Where can we reach you?",
  companyLabel: "Company Name (Optional)",
  companyPlaceholder: "Who are you building for?",
  projectTypeLabel: "Project Type",
  projectTypePlaceholder: "Select a project type",
  projectTypeOptions: [
    "New Website",
    "Custom Web Application",
    "Full-Stack Development",
    "Frontend Development",
    "Backend Development & API Integrations",
    "Existing Website Improvements",
    "Other",
  ],
  budgetLabel: "Estimated Budget (Optional)",
  budgetPlaceholder: "Select a budget (optional)",
  budgetOptions: [
    "Not yet determined",
    "Under $2,500",
    "$2,500–$5,000",
    "$5,000–$10,000",
    "$10,000+",
    "Prefer to discuss",
  ],
  detailsLabel: "Project Details",
  detailsPlaceholder:
    "Tell us about your idea, goals, or current challenges.",
  submitLabel: "Send",
  successTitle: "Message sent",
  successMessage:
    "Thanks for reaching out. We received your message and will get back to you soon.",
  sendAnotherLabel: "Send another message",
  privacyText:
    "By submitting this form, you agree that Simply Code LLC may use the information provided to respond to your inquiry.",
  privacyLinkLabel: "Privacy Policy",
};

function textOrFallback(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function optionsOrFallback(
  value: string[] | undefined,
  fallback: string[],
): string[] {
  const options = Array.from(
    new Set((value ?? []).map((option) => option.trim()).filter(Boolean)),
  );
  return options.length > 0 ? options : fallback;
}

/** Fills in defaults so newly added copy fields work without a data migration. */
export function resolveContactFormContent(
  content?: ContactFormContent,
): ResolvedContactFormContent {
  return {
    nameLabel: textOrFallback(content?.nameLabel, defaultContactFormContent.nameLabel),
    namePlaceholder: textOrFallback(
      content?.namePlaceholder,
      defaultContactFormContent.namePlaceholder,
    ),
    emailLabel: textOrFallback(
      content?.emailLabel,
      defaultContactFormContent.emailLabel,
    ),
    emailPlaceholder: textOrFallback(
      content?.emailPlaceholder,
      defaultContactFormContent.emailPlaceholder,
    ),
    companyLabel: textOrFallback(
      content?.companyLabel,
      defaultContactFormContent.companyLabel,
    ),
    companyPlaceholder: textOrFallback(
      content?.companyPlaceholder,
      defaultContactFormContent.companyPlaceholder,
    ),
    projectTypeLabel: textOrFallback(
      content?.projectTypeLabel,
      defaultContactFormContent.projectTypeLabel,
    ),
    projectTypePlaceholder: textOrFallback(
      content?.projectTypePlaceholder,
      defaultContactFormContent.projectTypePlaceholder,
    ),
    projectTypeOptions: optionsOrFallback(
      content?.projectTypeOptions,
      defaultContactFormContent.projectTypeOptions,
    ),
    budgetLabel: textOrFallback(
      content?.budgetLabel,
      defaultContactFormContent.budgetLabel,
    ),
    budgetPlaceholder: textOrFallback(
      content?.budgetPlaceholder,
      defaultContactFormContent.budgetPlaceholder,
    ),
    budgetOptions: optionsOrFallback(
      content?.budgetOptions,
      defaultContactFormContent.budgetOptions,
    ),
    detailsLabel: textOrFallback(
      content?.detailsLabel,
      defaultContactFormContent.detailsLabel,
    ),
    detailsPlaceholder: textOrFallback(
      content?.detailsPlaceholder,
      defaultContactFormContent.detailsPlaceholder,
    ),
    submitLabel: textOrFallback(
      content?.submitLabel,
      defaultContactFormContent.submitLabel,
    ),
    successTitle: textOrFallback(
      content?.successTitle,
      defaultContactFormContent.successTitle,
    ),
    successMessage: textOrFallback(
      content?.successMessage,
      defaultContactFormContent.successMessage,
    ),
    sendAnotherLabel: textOrFallback(
      content?.sendAnotherLabel,
      defaultContactFormContent.sendAnotherLabel,
    ),
    privacyText: textOrFallback(
      content?.privacyText,
      defaultContactFormContent.privacyText,
    ),
    privacyLinkLabel: textOrFallback(
      content?.privacyLinkLabel,
      defaultContactFormContent.privacyLinkLabel,
    ),
  };
}
