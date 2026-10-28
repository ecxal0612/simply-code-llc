import type {
  PageSectionContent,
  PageSectionKind,
  PageStatus,
} from "~/lib/pages/types";
import { defaultContactFormContent } from "~/lib/contact/form-content";
import { homeCopy } from "~/lib/home/content";

export type DefaultSection = {
  key: string;
  label: string;
  kind: PageSectionKind;
  content: PageSectionContent;
};

export type DefaultPage = {
  title: string;
  slug: string;
  path: string;
  status: PageStatus;
  sections: DefaultSection[];
};

function p(...paragraphs: string[]) {
  return paragraphs.map((text) => `<p>${text}</p>`).join("");
}

function ul(items: string[]) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

const aboutTeam = [
  {
    title: "Ryan Hunter",
    meta: "Lead Full-Stack Developer",
    description:
      "Experienced in building scalable web applications with Next.js and TypeScript. Focuses on architecture, APIs, and delivering reliable solutions.",
  },
  {
    title: "Alex Carter",
    meta: "Frontend Developer",
    description:
      "Specializes in responsive UI, component systems, and accessibility. Passionate about clean interfaces and smooth user experiences.",
  },
  {
    title: "Morgan Ellis",
    meta: "Backend Developer",
    description:
      "Focuses on server-side logic, data modeling, and integrations. Ensures performance, security, and maintainability.",
  },
  {
    title: "Jordan Kim",
    meta: "Full-Stack Developer",
    description:
      "Bridges frontend and backend to ship features end-to-end. Skilled in modern tooling, testing, and deployment workflows.",
  },
];

const aboutWhy = [
  {
    title: "Dedicated Team",
    description: "Four developers working closely from start to finish.",
  },
  {
    title: "Full-Stack Capable",
    description: "Frontend, backend, APIs, and deployment under one roof.",
  },
  {
    title: "Thoughtful Engineering",
    description: "Pragmatic decisions that balance quality and timelines.",
  },
  {
    title: "Clear Communication",
    description: "Straightforward updates and aligned priorities.",
  },
];

const privacySections: DefaultSection[] = [
  {
    key: "information-we-collect",
    label: "Information We Collect",
    kind: "policy",
    content: {
      title: "Information We Collect",
      bodyHtml: `${p("We may collect information that you voluntarily provide when using our website, including:")}${ul(
        [
          "Name and contact information.",
          "Email address and company name.",
          "Project descriptions and service inquiries.",
          "Information included in messages you send us.",
        ],
      )}${p(
        "Depending on the website&apos;s configuration, we may also collect certain technical information, such as browser type, device information, pages visited, and website usage data.",
      )}`,
    },
  },
  {
    key: "how-we-use-your-information",
    label: "How We Use Your Information",
    kind: "policy",
    content: {
      title: "How We Use Your Information",
      bodyHtml: `${p("We may use the information collected to:")}${ul([
        "Respond to inquiries and communicate with prospective clients.",
        "Evaluate project requirements and discuss potential engagements.",
        "Operate, maintain, and improve our website.",
        "Protect the website against abuse, spam, and unauthorized activity.",
        "Meet applicable legal obligations.",
      ])}`,
    },
  },
  {
    key: "cookies-analytics",
    label: "Cookies & Analytics",
    kind: "policy",
    content: {
      title: "Cookies & Analytics",
      bodyHtml: p(
        "Our website may use cookies or similar technologies to support website functionality, understand usage patterns, or improve the user experience. If analytics or other third-party tracking tools are used, we will identify the relevant technologies and explain the choices available to visitors where required by applicable law.",
      ),
    },
  },
  {
    key: "how-we-share-information",
    label: "How We Share Information",
    kind: "policy",
    content: {
      title: "How We Share Information",
      bodyHtml: p(
        "We may share personal information with service providers who help us operate the website, process inquiries, or provide business services, where necessary and appropriate. We may also disclose information where required by law or when necessary to protect our rights, security, or the rights and safety of others.",
      ),
    },
  },
  {
    key: "data-retention-security",
    label: "Data Retention & Security",
    kind: "policy",
    content: {
      title: "Data Retention & Security",
      bodyHtml: p(
        "We retain personal information for as long as reasonably necessary for the purposes described in this policy, subject to applicable legal requirements. We use appropriate measures designed to protect personal information against unauthorized access, loss, misuse, or disclosure. However, no method of transmission or electronic storage can be guaranteed to be completely secure.",
      ),
    },
  },
  {
    key: "your-privacy-rights",
    label: "Your Privacy Rights",
    kind: "policy",
    content: {
      title: "Your Privacy Rights",
      bodyHtml: p(
        "Depending on your location and applicable law, you may have rights concerning your personal information, including the right to request access, correction, deletion, or information about how your data is used. To submit a privacy-related request, contact us at hello@simplycode.com. We will handle requests in accordance with applicable law.",
      ),
    },
  },
  {
    key: "third-party-services",
    label: "Third-Party Services & Links",
    kind: "policy",
    content: {
      title: "Third-Party Services & Links",
      bodyHtml: p(
        "Our website may link to external websites or use third-party services. Those services may have their own privacy policies and practices. We encourage visitors to review the privacy policies of any third-party services they use.",
      ),
    },
  },
  {
    key: "childrens-privacy",
    label: "Children's Privacy",
    kind: "policy",
    content: {
      title: "Children's Privacy",
      bodyHtml: p(
        "Our website and services are not intended to collect personal information from children without appropriate authorization. If we learn that we have collected personal information in circumstances that require its deletion or other action under applicable law, we will take appropriate steps.",
      ),
    },
  },
  {
    key: "changes-to-this-policy",
    label: "Changes to This Policy",
    kind: "policy",
    content: {
      title: "Changes to This Policy",
      bodyHtml: p(
        "We may update this Privacy Policy to reflect changes in our practices, website functionality, or legal obligations. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page. Any additional notice will be provided where required.",
      ),
    },
  },
];

export const defaultPages: DefaultPage[] = [
  {
    title: "Home",
    slug: "home",
    path: "/",
    status: "published",
    sections: [
      {
        key: "hero",
        label: "Hero",
        kind: "home-hero",
        content: {
          eyebrow: homeCopy.hero.eyebrow,
          title: homeCopy.hero.headline,
          bodyHtml: p(homeCopy.hero.body),
          ctaLabel: homeCopy.hero.primaryCta,
          ctaHref: "#contact",
          secondaryCtaLabel: homeCopy.hero.secondaryCta,
          secondaryCtaHref: "#services",
          images: [
            {
              slot: "home.hero",
              label: "Hero background",
              alt: "Home hero background",
            },
          ],
        },
      },
      {
        key: "services",
        label: "Services",
        kind: "home-services",
        content: {
          eyebrow: "Services",
          title: "What we build",
          bodyHtml: p(
            "A quick look at the core ways we help businesses bring ideas to life. From websites to full-stack applications, we focus on practical, maintainable solutions.",
          ),
          ctaLabel: "View all services",
          ctaHref: "/services",
          secondaryCtaLabel: "Explore our work",
          secondaryCtaHref: "/work",
          items: [
            {
              title: "Custom Websites",
              description:
                "Responsive, content-focused sites built for clarity and performance.",
            },
            {
              title: "Full-Stack Apps",
              description:
                "End-to-end web applications with clean architecture and reliable logic.",
            },
            {
              title: "APIs & Integrations",
              description:
                "Connect your tools and data with secure, scalable integrations.",
            },
            {
              title: "Performance & Deployment",
              description:
                "Optimization and production-ready deployments with modern workflows.",
            },
          ],
        },
      },
      {
        key: "experience",
        label: "Experience",
        kind: "home-experience",
        content: {
          eyebrow: "Experience",
          title: "Proven experience with Zoom",
          bodyHtml: p(
            "Our team has prior experience contributing to website development for Zoom. We bring that attention to detail and structured approach to every Simply Code project.",
          ),
          ctaLabel: "See our work",
          ctaHref: "/work",
          secondaryCtaLabel: "About our team",
          secondaryCtaHref: "/about",
          images: [
            {
              slot: "home.experience",
              label: "Experience section image",
              alt: "Experience section image",
            },
          ],
        },
      },
      {
        key: "technology",
        label: "Technology Stack",
        kind: "home-technology",
        content: {
          eyebrow: "Technology Stack",
          title: "Next.js, Vercel & full-stack",
          bodyHtml: p(
            "Focused on a modern, maintainable stack to ship faster with confidence.",
          ),
          ctaLabel: "Learn more",
          ctaHref: "/services",
          secondaryCtaLabel: "See our work",
          secondaryCtaHref: "/work",
          items: [
            "Next.js",
            "React",
            "TypeScript",
            "Vercel",
            "APIs & Integrations",
            "Drizzle ORM",
          ].map((title) => ({
            title,
          })),
        },
      },
      {
        key: "process",
        label: "Development Process",
        kind: "home-process",
        content: {
          eyebrow: "Development Process",
          title: "A clear path from idea to launch",
          bodyHtml: p(
            "A lightweight, practical process that keeps projects focused and moving forward.",
          ),
          ctaLabel: "Learn more about our approach",
          ctaHref: "/about",
          secondaryCtaLabel: "Start a project",
          secondaryCtaHref: "/contact",
          items: homeCopy.process.steps.map((step) => ({
            title: step.title,
            description: step.description,
            meta: step.step,
          })),
        },
      },
      {
        key: "projects",
        label: "Featured Projects",
        kind: "home-projects",
        content: {
          eyebrow: "Featured Projects",
          title: "A glimpse of our work",
          bodyHtml: p(
            "Selected examples that showcase our approach to thoughtful engineering.",
          ),
          ctaLabel: "View all projects",
          ctaHref: "/work",
          secondaryCtaLabel: "Start a project",
          secondaryCtaHref: "/contact",
          items: [],
        },
      },
      {
        key: "contact",
        label: "Contact CTA",
        kind: "home-contact",
        content: {
          eyebrow: "Start a Project",
          title: "Ready to build something together?",
          bodyHtml: p(
            "Tell us about your website, web application, or improvement project. We&apos;d love to talk.",
          ),
          ctaLabel: "Get in Touch",
          ctaHref: "/contact",
          secondaryCtaLabel: "Explore our services",
          secondaryCtaHref: "/services",
        },
      },
    ],
  },
  {
    title: "About Us",
    slug: "about",
    path: "/about",
    status: "published",
    sections: [
      {
        key: "hero",
        label: "Page hero",
        kind: "hero",
        content: {
          eyebrow: "ABOUT SIMPLY CODE",
          title: "Good software starts with a simple idea.",
          bodyHtml: p(
            "Simply Code LLC is a team of four developers focused on building modern websites and full-stack web applications. We combine technical problem-solving, modern development tools, and a collaborative approach to turn business requirements into practical digital solutions. Our goal is simple: build software with purpose, quality, and room to grow.",
          ),
        },
      },
      {
        key: "who-we-are",
        label: "Who We Are",
        kind: "about-who",
        content: {
          eyebrow: "Who We Are",
          title: "A focused team with a full-stack mindset.",
          bodyHtml: p(
            "We believe that building great software requires more than writing code. It requires understanding the problem, choosing the right approach, and paying attention to the details that make a product useful and dependable.",
            "As a team of four developers, we collaborate across frontend and backend development to deliver connected digital experiences, from the initial structure to the functionality behind every interaction.",
            "We focus on understanding each project's goals and developing solutions that fit its actual needs.",
          ),
          items: [
            {
              title: "Our Mission",
              description:
                "Making modern web development work for your business. Our mission is to help businesses bring their ideas to life through well-engineered websites and web applications. We aim to make complex technical challenges manageable by combining modern technology, thoughtful implementation, and a practical approach to problem-solving.",
            },
            {
              title: "Our Vision",
              description:
                "Building a future through better digital experiences. We want Simply Code to be a trusted development partner for businesses seeking modern, reliable, and maintainable web solutions. We strive to build lasting client relationships by delivering thoughtful work, communicating clearly, and continuously improving our technical capabilities.",
            },
          ],
        },
      },
      {
        key: "team",
        label: "Meet the Team",
        kind: "about-team",
        content: {
          eyebrow: "Meet the Team",
          title: "Four developers. Different perspectives. One shared goal.",
          bodyHtml: p(
            "Our team brings together frontend and backend capabilities to develop complete web solutions. We collaborate to solve problems, share technical knowledge, and keep projects moving toward their goals.",
          ),
          items: aboutTeam,
        },
      },
      {
        key: "why",
        label: "Why Simply Code",
        kind: "about-why",
        content: {
          eyebrow: "Why Simply Code",
          title: "Small team. Practical impact.",
          bodyHtml: p(
            "Focused on clear communication, maintainability, and building solutions that fit your goals.",
          ),
          items: aboutWhy,
        },
      },
      {
        key: "cta",
        label: "CTA",
        kind: "cta",
        content: {
          title: "Let's build something meaningful together.",
          bodyHtml: p(
            "Get to know the team behind Simply Code and discover how we can help bring your next digital project to life.",
          ),
          ctaLabel: "Get in Touch",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    title: "Services",
    slug: "services",
    path: "/services",
    status: "published",
    sections: [
      {
        key: "hero",
        label: "Page hero",
        kind: "hero",
        content: {
          eyebrow: "OUR SERVICES",
          title: "Full-stack development for modern businesses.",
          bodyHtml: p(
            "From high-performance websites to custom web applications, we build digital solutions that combine thoughtful frontend experiences with reliable backend functionality. Our team works across the entire development stack to help businesses turn ideas into practical, maintainable, and scalable web solutions.",
          ),
          ctaLabel: "Discuss Your Project",
          ctaHref: "/contact",
          secondaryCtaLabel: "Explore Our Work",
          secondaryCtaHref: "/work",
        },
      },
      {
        key: "custom-website-development",
        label: "Custom Website Development",
        kind: "services-intro",
        content: {
          eyebrow: "Custom Website Development",
          title: "Websites built around your business.",
          bodyHtml: p(
            "Your website is often the first interaction people have with your business. We build modern, responsive websites designed to communicate your value, engage your audience, and support your business goals. From landing pages to multi-page corporate websites, we focus on clear structure, thoughtful user experiences, and maintainable implementations.",
          ),
          items: [
            { title: "Custom website development" },
            { title: "Responsive layouts across devices" },
            { title: "Reusable UI components" },
            { title: "Content-focused page structures" },
            { title: "Technical SEO foundations" },
            { title: "Deployment and launch support" },
          ],
        },
      },
      {
        key: "performance",
        label: "Performance & Optimization",
        kind: "services-features",
        content: {
          eyebrow: "Performance & Optimization",
          title: "Better experiences start with better performance.",
          bodyHtml: p(
            "Slow pages and confusing interactions can frustrate users. We consider performance throughout development, using appropriate rendering strategies, efficient components, and optimization techniques suited to each project.",
          ),
          items: [
            { title: "Page loading performance" },
            { title: "Rendering and caching strategies" },
            { title: "Image and asset optimization" },
            { title: "Core Web Vitals considerations" },
            { title: "Technical SEO foundations" },
            { title: "Responsive behavior across devices" },
          ],
        },
      },
      {
        key: "deployment",
        label: "Deployment & Modernization",
        kind: "services-features",
        content: {
          eyebrow: "Deployment & Modernization",
          title: "From development to production, with confidence.",
          bodyHtml: p(
            "We help bring web projects into production using modern development and deployment workflows. We can also help improve existing applications by refining their architecture, introducing new functionality, or modernizing specific parts of the codebase.",
          ),
          items: [
            { title: "Vercel deployments" },
            { title: "Preview environments" },
            { title: "Production configuration" },
            { title: "Environment variable management" },
            { title: "Existing application improvements" },
            { title: "Post-launch enhancements within an agreed scope" },
          ],
        },
      },
      {
        key: "technology",
        label: "Our Technology",
        kind: "services-features",
        content: {
          eyebrow: "Our Technology",
          title: "A modern stack for modern challenges.",
          bodyHtml: p(
            "We use Next.js and Vercel as our core technology stack, selecting complementary technologies according to each project's requirements.",
          ),
          items: [
            { title: "Next.js" },
            { title: "React" },
            { title: "Vercel" },
            { title: "APIs & integrations" },
            { title: "Supporting technologies" },
          ],
        },
      },
      {
        key: "cta",
        label: "CTA",
        kind: "cta",
        content: {
          title: "Have a project in mind?",
          bodyHtml: p(
            "Let's talk about what you're building, what challenges you're facing, and how we can help you move forward.",
          ),
          ctaLabel: "Tell Us About Your Project.",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    title: "Our Work",
    slug: "work",
    path: "/work",
    status: "published",
    sections: [
      {
        key: "hero",
        label: "Page hero",
        kind: "hero",
        content: {
          eyebrow: "OUR WORK",
          title: "Turning ideas into digital experiences.",
          bodyHtml: p(
            "Every project starts with a challenge. We bring together thoughtful engineering, modern technology, and practical problem-solving to build websites and applications that serve real business needs. Explore selected projects that showcase our approach to web development and full-stack engineering.",
          ),
          ctaLabel: "Start a Project With Us",
          ctaHref: "/contact",
        },
      },
      {
        key: "experience",
        label: "Experience With Zoom",
        kind: "work-experience",
        content: {
          eyebrow: "Experience With Zoom",
          title: "A track record of structured delivery.",
          bodyHtml: p(
            "Our team has experience working on website development for Zoom. That background shapes our focus on clean implementation, responsiveness, and reliability.",
          ),
          images: [
            {
              slot: "work.experience",
              label: "Experience image",
              alt: "Experience with Zoom",
            },
          ],
        },
      },
      {
        key: "projects",
        label: "Selected Work",
        kind: "work-projects",
        content: {
          eyebrow: "Selected work",
          title:
            "Discover a selection of projects that demonstrate our development capabilities.",
          items: [],
        },
      },
      {
        key: "testimonials",
        label: "Testimonials",
        kind: "testimonials",
        content: {
          eyebrow: "Testimonials",
          title: "What clients say about working with us.",
          items: [
            {
              title: "Alex Johnson",
              description:
                "Simply Code delivered a clean, responsive website ahead of schedule with great attention to detail.",
              meta: "Product Manager, Tech Co.",
            },
            {
              title: "Taylor Rivera",
              description:
                "Professional team, clear communication, and a solution that fits our needs perfectly.",
              meta: "Founder, StartupX",
            },
            {
              title: "Morgan Chen",
              description:
                "Great experience from discovery to launch. Highly recommend for full-stack projects.",
              meta: "CTO, Growth Labs",
            },
          ],
        },
      },
      {
        key: "cta",
        label: "CTA",
        kind: "cta",
        content: {
          title: "Your project could be our next collaboration.",
          bodyHtml: p(
            "Have a website or application in mind? Let's discuss your goals and explore how we can bring your idea to life.",
          ),
          ctaLabel: "Start Your Project",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    title: "Blog",
    slug: "blog",
    path: "/blog",
    status: "published",
    sections: [
      {
        key: "hero",
        label: "Page hero",
        kind: "hero",
        content: {
          eyebrow: "OUR BLOG",
          title: "Insights from the Simply Code team.",
          bodyHtml: p(
            "Updates, technical insights, and thoughts on building modern websites and web applications.",
          ),
        },
      },
      {
        key: "posts",
        label: "Posts",
        kind: "blog-posts",
        content: {
          title: "Latest posts",
          bodyHtml: p(
            "New articles are published automatically as they are marked published in the dashboard.",
          ),
          postsPerPage: 6,
        },
      },
      {
        key: "cta",
        label: "CTA",
        kind: "cta",
        content: {
          title: "Your project could be our next collaboration.",
          bodyHtml: p(
            "Have a website or application in mind? Let's discuss your goals and explore how we can bring your idea to life.",
          ),
          ctaLabel: "Start Your Project",
          ctaHref: "/contact",
        },
      },
    ],
  },
  {
    title: "Contact",
    slug: "contact",
    path: "/contact",
    status: "published",
    sections: [
      {
        key: "hero",
        label: "Page hero",
        kind: "hero",
        content: {
          eyebrow: "GET IN TOUCH",
          title: "Let's talk about what you're building.",
          bodyHtml: p(
            "Have a website idea, a web application to develop, or an existing project that needs improvement? We'd love to hear about it. Tell us a little about your goals and challenges, and let's explore how Simply Code can help.",
          ),
        },
      },
      {
        key: "contact-intro",
        label: "Tell Us About Your Project",
        kind: "contact-intro",
        content: {
          eyebrow: "Tell us about your project.",
          title: "Every great project starts with a conversation.",
          bodyHtml: p(
            "Share the basics with us, and we&apos;ll have a better understanding of what you&apos;re looking to accomplish.",
          ),
          items: [
            {
              title: "We review your inquiry",
              meta: "01",
              description:
                "We'll review the information you share to understand your project's goals and requirements.",
            },
            {
              title: "We start a conversation",
              meta: "02",
              description:
                "We'll follow up using your preferred contact details to clarify questions and discuss your needs.",
            },
            {
              title: "We explore the next steps",
              meta: "03",
              description:
                "If the project is a good fit, we'll discuss the scope, potential approach, timeline, and budget before moving forward.",
            },
          ],
          contactForm: defaultContactFormContent,
        },
      },
    ],
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    path: "/privacy-policy",
    status: "published",
    sections: [
      {
        key: "header",
        label: "Header",
        kind: "policy-hero",
        content: {
          eyebrow: "Privacy Policy",
          title: "Privacy Policy",
          updatedAtLabel: "October 24, 2026",
          bodyHtml: p(
            'Simply Code LLC ("Simply Code," "we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect personal information when you visit our website or contact us about our services.',
          ),
        },
      },
      ...privacySections,
    ],
  },
];
