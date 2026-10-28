/**
 * One-off seed: published blog posts for Simply Code LLC.
 * Run: pnpm dlx tsx --env-file=.env scripts/seed-sample-posts.ts
 *
 * Existing posts (matched by slug) get their body content refreshed.
 */
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/server/db/schema.ts";

const { users, posts } = schema;

const samplePosts = [
  {
    title: "Why we build marketing sites with Next.js",
    slug: "why-we-build-marketing-sites-with-nextjs",
    categories: ["Web Development", "Next.js"],
    body: `<p>Most of our client sites need fast first loads, clear SEO, and room to grow into dashboards or member areas later. Next.js gives us that without maintaining separate front-end and API stacks for every project.</p>
<p>We use the App Router for layouts that stay consistent, server components for content that can render on the edge, and client components only where interactivity actually matters. That balance keeps pages snappy on mobile and straightforward for your team to update through the CMS we wire up.</p>

<h2>Performance that shows up in analytics</h2>
<p>Marketing leaders care about conversion, but slow pages quietly hurt both ads and organic search. With Next.js we ship optimized images, sensible font loading, and HTML that is meaningful before JavaScript hydrates. Core Web Vitals are not a side project—they are part of how we structure each template.</p>
<p>When we audit an existing site before a rebuild, we often find the same pattern: heavy client bundles on pages that are mostly text and imagery. Moving those routes to the server cuts time-to-interactive without sacrificing the animations or forms you still need on contact and pricing pages.</p>

<h2>SEO and content workflows</h2>
<p>Search engines reward clear titles, canonical URLs, and structured metadata. The App Router makes it natural to define per-page <strong>metadata</strong> and Open Graph tags next to the content they describe. Your blog posts, service pages, and location pages each get the right description instead of one global default.</p>
<ul>
<li>Human-readable URLs aligned with your CMS slugs</li>
<li>Sitemaps generated from published content</li>
<li>Preview links for drafts before you hit publish</li>
</ul>

<h2>Room to grow without a rewrite</h2>
<p>A marketing site rarely stays “just marketing” forever. Clients ask for gated resources, partner portals, or simple tools tied to their CRM. Because Next.js sits in the same codebase as API routes and server actions, we can add authenticated areas incrementally—often reusing the same design system and deployment pipeline you already trust.</p>
<blockquote>We would rather ship a focused marketing site in weeks and extend it than over-build a monolith nobody uses on day one.</blockquote>

<h2>What we typically deliver first</h2>
<p>If you are planning a new marketing site, we usually start with your core pages, analytics, and forms—then layer integrations once the foundation is stable. That sequence keeps stakeholders aligned and gives us real traffic data before we invest in heavier features.</p>
<ol>
<li>Brand-aligned home, services, and contact flows</li>
<li>Blog or news with an editor-friendly CMS</li>
<li>Analytics, spam protection, and basic accessibility checks</li>
<li>Integrations (CRM, scheduling, payments) once messaging is proven</li>
</ol>
<p>When Next.js is the right fit, you get a site that feels polished on day one and stays maintainable when your team publishes new content every week.</p>`,
  },
  {
    title: "What to prepare before starting a custom web app",
    slug: "prepare-before-starting-custom-web-app",
    categories: ["Product", "Planning"],
    body: `<p>The smoothest projects share a short list of decisions made early: who the primary users are, what they must accomplish in the first release, and which systems already hold your data today.</p>
<p>We ask for examples of workflows you like, export samples from spreadsheets or CRMs, and any compliance rules that affect login or data storage. You do not need a full specification—clear priorities and one decision-maker on your side are enough to begin.</p>

<h2>Know your primary users</h2>
<p>Custom software fails when it tries to please every stakeholder equally on version one. We work with you to name the <strong>primary persona</strong>—the person whose job gets measurably easier if the app works—and the secondary roles that can wait a sprint or two.</p>
<p>Write down what a good week looks like for that user. Which tasks are repetitive? Where do they copy data between tools? Those answers become user stories we can estimate and demo.</p>

<h2>Inventory your data and integrations</h2>
<p>Even greenfield apps rarely start in a vacuum. Payroll, inventory, billing, or support data often lives in software you already pay for. Before we diagram screens, we list:</p>
<ul>
<li>Systems of record (where truth lives today)</li>
<li>Export formats you can share safely (CSV samples, sandbox API keys)</li>
<li>Manual steps you are trying to eliminate</li>
<li>Retention or privacy rules that affect what we store</li>
</ul>
<p>A rough integration map saves weeks of rework later. We do not need every field mapped—just enough to spot blockers early.</p>

<h2>Define “done” for the first release</h2>
<p>Scope creep is predictable; we plan for it with milestones. The first release should be <strong>shippable and testable</strong> with real users, not a feature checklist copied from a three-year roadmap.</p>
<h3>Helpful inputs from your team</h3>
<ul>
<li>Wireframes or screenshots of tools you admire (even if they are not in your industry)</li>
<li>A ranked list: must-have, should-have, later</li>
<li>One person who can say “yes, ship it” without a committee</li>
</ul>

<h2>Compliance and access</h2>
<p>If staff or customers log in, tell us about SSO expectations, password policies, and whether certain data must stay in a specific region. Healthcare, education, and finance clients often have templates we can follow; bringing them up front avoids expensive retrofits.</p>
<blockquote>You do not need a 40-page specification. You need clarity on who wins first and what “success in 90 days” means.</blockquote>

<h2>How we kick off after you are prepared</h2>
<p>From there we propose milestones you can ship and test, rather than a single big launch months away. A short discovery call, a shared backlog, and a staging environment you can click through usually beat months of silent document drafting.</p>
<p>When you come prepared—even lightly—we spend the first sprint building something you can react to, not debating abstractions. That is when custom software starts to feel real for your team.</p>`,
  },
  {
    title: "How we approach accessibility on client projects",
    slug: "accessibility-on-client-projects",
    categories: ["Frontend", "Accessibility"],
    body: `<p>Accessible sites are better for everyone: keyboard navigation, readable contrast, and semantic HTML improve SEO and reduce support tickets too.</p>
<p>During design we check color pairs and focus states. In development we use landmarks, labels on forms, and alt text that describes purpose—not just decoration. Before launch we run automated checks and manual passes on critical flows like contact forms and checkout.</p>

<h2>Accessibility is a quality bar, not a checkbox</h2>
<p>We treat WCAG-oriented practices as part of shipping professional work, the same way we treat responsive layout. That does not mean every page needs a legal audit on day one—it means we avoid known anti-patterns and document how your team keeps new pages consistent after handoff.</p>
<p>Teams that invest early spend less time fixing “why doesn’t Tab reach the menu?” bugs reported by enterprise buyers during procurement.</p>

<h2>Design phase: contrast, type, and focus</h2>
<p>Before pixels become code, we review:</p>
<ul>
<li><strong>Color contrast</strong> for body text, buttons, and links on real backgrounds—not just the brand palette swatch</li>
<li><strong>Focus indicators</strong> that remain visible on dark headers and image heroes</li>
<li><strong>Touch targets</strong> large enough for mobile users and assistive tech</li>
<li><strong>Motion</strong> preferences, reducing unnecessary animation when users ask the OS to limit motion</li>
</ul>
<p>These choices are cheaper in Figma than after launch when marketing has already approved screenshots.</p>

<h2>Development: semantics and keyboard paths</h2>
<p>We structure pages with headings that follow a logical order, use native buttons and links appropriately, and associate every form field with a visible label. Custom widgets—modals, menus, carousels—get keyboard traps and escape behavior tested on purpose.</p>
<h3>Images and media</h3>
<p>Decorative images use empty alt text; informative images describe what matters for the surrounding content. If a chart or diagram is essential, we supplement with a short text summary so no one relies on color alone.</p>

<h2>Testing before and after launch</h2>
<p>Automated tools catch a fraction of issues; human review catches context. Before go-live we combine both:</p>
<ol>
<li>Scanner pass on key templates (home, contact, primary conversion flow)</li>
<li>Keyboard-only walkthrough of navigation and forms</li>
<li>Screen reader spot checks on pages with complex components</li>
<li>Regression checks when you add new CMS content types</li>
</ol>

<blockquote>Accessibility is ongoing; we document patterns in your component library so new pages stay consistent after handoff.</blockquote>

<h2>Handoff for your content team</h2>
<p>Editors affect accessibility too—heading levels in the CMS, link text that makes sense out of context, and PDFs uploaded without structure. We provide short guidelines alongside your dashboard so published posts stay as approachable as the templates we built.</p>
<p>When procurement asks for your accessibility posture, you will have a credible story: intentional design, tested flows, and a plan for continuous improvement—not a single PDF generated the night before the RFP deadline.</p>`,
  },
  {
    title: "When a static site is enough—and when it is not",
    slug: "when-a-static-site-is-enough",
    categories: ["Strategy", "Web Development"],
    body: `<p>A content-focused marketing site with a contact form, blog, and occasional updates often does well as a modern static or mostly-static deployment. Costs stay predictable and performance is excellent worldwide.</p>
<p>You likely need authenticated areas, real-time data, or complex workflows when staff and customers must log in, update records, or trigger approvals. That is when we recommend a full application layer with a database and role-based access.</p>

<h2>What “static enough” looks like in 2026</h2>
<p>Modern static does not mean “plain HTML files on FTP.” We still use Next.js, a CMS, preview deployments, and forms that post to your inbox or CRM. Pages are generated at build time or cached at the edge, so visitors get fast responses without you running a server cluster for brochure content.</p>
<p><strong>Good fits</strong> include company sites, campaign landing hubs, resource libraries, and blogs where editors publish weekly or monthly—not thousands of times per hour.</p>

<h2>Signals you can stay lean</h2>
<ul>
<li>Content changes are editorial, not transactional</li>
<li>Forms route to email or a simple integration—no multi-step approvals in the site itself</li>
<li>Personalization is light (industry pages, not per-user dashboards)</li>
<li>Traffic spikes are marketing-driven, not exchange-trading spikes</li>
</ul>
<p>In those cases we optimize for speed, clarity, and a CMS your marketing team actually enjoys using.</p>

<h2>Signals you need an application</h2>
<p>When users sign in, you are managing permissions—not just pages. Common triggers we see:</p>
<ul>
<li>Customers or partners need accounts, order history, or document uploads</li>
<li>Staff workflows replace spreadsheets with audited actions</li>
<li>Data must be queried, filtered, and updated in real time</li>
<li>Integrations require secure server-side credentials and background jobs</li>
</ul>
<p>That is when we recommend a database, authenticated API routes, and role-based access designed with your org chart in mind.</p>

<h2>Hybrid paths we use often</h2>
<p>Many clients start marketing-first and add app features later. Next.js lets us keep the public site fast while mounting a <strong>/dashboard</strong> or portal on the same domain, shared design system, and deployment pipeline.</p>
<blockquote>We help you choose the smaller option when it fits, and plan a path to add app features later without rebuilding from scratch.</blockquote>

<h2>How we decide together</h2>
<p>In a short architecture conversation we map your next 12–18 months: campaigns, product launches, and internal tools. If the roadmap is mostly publish-and-promote, we lean static. If operations teams are already asking for “a login where we can…”, we scope an app slice early so data models do not fight your later CMS.</p>
<p>The goal is honest sizing—no shelfware app, no brittle spreadsheet glued to a pretty homepage.</p>`,
  },
  {
    title: "Launch checklist: from staging to production on Vercel",
    slug: "launch-checklist-staging-to-production-vercel",
    categories: ["DevOps", "Next.js"],
    body: `<p>Before go-live we verify environment variables on production, run database migrations, and confirm email and payment providers use live keys—not test mode.</p>
<p>We set up redirects from old URLs, submit sitemaps, and enable error monitoring so issues surface early. DNS changes are scheduled with enough TTL buffer to avoid downtime.</p>

<h2>Staging should mirror production</h2>
<p>A launch checklist only works if you rehearse on staging first. We align Node version, environment variable names, and build commands with Vercel production settings. If staging uses test API keys but production does not, we document the swap so nobody promotes the wrong values at midnight.</p>
<p>Content editors get a preview URL to approve copy; engineering runs migrations against a database branch or snapshot when available.</p>

<h2>Environment and secrets</h2>
<p>On Vercel, production environment variables are scoped separately from preview. We verify:</p>
<ul>
<li><strong>DATABASE_URL</strong> points at the production database (pooled connection where required)</li>
<li><strong>AUTH_SECRET</strong> and OAuth redirect URLs match the live domain</li>
<li>Email (for example Postmark) uses verified sender domains and production tokens</li>
<li>Payment providers are in live mode with webhooks aimed at production endpoints</li>
<li>Feature flags that should be off in prod are not accidentally inherited from preview</li>
</ul>

<h2>Data and routing</h2>
<p>Schema changes run through your migration process—<code>db:migrate</code> or the workflow your team standardizes on—before traffic hits the new build. We maintain redirect rules for renamed slugs and retired paths so inbound links and ads do not 404 on day one.</p>
<h3>DNS and certificates</h3>
<p>DNS changes are scheduled with TTL in mind. We confirm apex and www records, verify SSL provisioning on Vercel, and keep a rollback DNS plan if an old host must serve traffic briefly during cutover.</p>

<h2>Observability and SEO</h2>
<p>After deploy we confirm:</p>
<ol>
<li>Error monitoring (Sentry or similar) receives events from production</li>
<li>Analytics tags fire on key conversion pages</li>
<li><strong>robots.txt</strong> and sitemap URLs resolve on the live domain</li>
<li>Social preview images and metadata on home and top landing pages</li>
</ol>

<blockquote>After launch we watch analytics and server logs for the first few days and keep a short rollback plan ready. A calm launch is usually the result of rehearsing this checklist on staging first.</blockquote>

<h2>The first 72 hours</h2>
<p>Launches are not finished when the deploy turns green. We monitor form submissions, auth flows, and background jobs while your team announces the site. If something spikes—404s on an old blog path, webhooks failing—we fix forward with redirects or config patches rather than panicking.</p>
<p>When this checklist is part of the project plan, go-live feels boring in the best way—and your stakeholders remember the new site, not an outage.</p>`,
  },
  {
    title: "Choosing a CMS that your marketing team will actually use",
    slug: "choosing-a-cms-your-team-will-use",
    categories: ["Strategy", "Web Development"],
    body: `<p>A beautiful site nobody can update becomes a bottleneck within months. We pick content tools based on who publishes day to day—not only on what developers prefer to maintain.</p>
<p>For most Simply Code clients, that means a dashboard tied to the same Next.js app you ship: pages, blog posts, and forms in one place, with previews before publish and roles that match how your org already works.</p>

<h2>Start with publishing workflows, not feature lists</h2>
<p>Before comparing products, list what your team changes weekly: hero copy, case studies, blog posts, job listings, pricing tables. Note who needs approval and whether non-technical staff should touch layouts or only text and images.</p>
<p>Those answers narrow the field quickly. A tool built for e-commerce catalogs is painful for a services firm that mostly edits long-form pages and PDFs.</p>

<h2>What we optimize for</h2>
<ul>
<li><strong>Preview links</strong> so stakeholders sign off on real URLs, not screenshots</li>
<li><strong>Sensible defaults</strong>—new blog posts inherit typography and SEO patterns</li>
<li><strong>Media handling</strong> with size limits and alt text prompts</li>
<li><strong>Audit-friendly roles</strong> when multiple people touch production content</li>
</ul>

<h2>When a headless CMS still makes sense</h2>
<p>Larger marketing orgs with dedicated content strategists sometimes keep a separate CMS and sync via API. We use that pattern when multiple channels—web, app, email—must share structured content blocks. For a focused company site, an integrated dashboard often ships faster and costs less to operate.</p>
<blockquote>The best CMS is the one your team opens without filing a ticket to engineering.</blockquote>

<h2>Handoff that sticks</h2>
<p>We document a short publishing checklist: draft → preview → publish, plus where forms and analytics live. A one-hour working session beats a fifty-page manual nobody reads.</p>
<p>When the CMS matches real workflows, your site stays fresh—and search engines notice.</p>`,
  },
  {
    title: "Contact forms that reach your inbox (and stay out of spam folders)",
    slug: "contact-forms-inbox-deliverability",
    categories: ["Web Development", "Product"],
    body: `<p>A contact form that silently fails is worse than no form at all. We treat inbound leads as infrastructure: validation, delivery, notifications, and a dashboard paper trail.</p>
<p>Simply Code sites typically send through transactional email providers with verified domains, not generic SMTP passwords that trigger spam filters on day one.</p>

<h2>What happens when someone hits Send</h2>
<p>Behind a simple form we usually wire:</p>
<ol>
<li>Server-side validation and bot protection (honeypots, rate limits, or CAPTCHA when needed)</li>
<li>A stored message record your team can review in the dashboard</li>
<li>Email notification to the right distribution list</li>
<li>Optional auto-reply so visitors know you received their note</li>
</ol>
<p>Storing submissions in the database means you can recover a lead even if email forwarding misconfigured for an hour during launch week.</p>

<h2>Domain and sender reputation</h2>
<p>We configure SPF, DKIM, and a dedicated From address on a subdomain or root domain you control. Marketing@ and hello@ addresses should match what visitors expect after reading your site—not a no-reply address on a free provider.</p>
<p>Sandbox modes are great for staging; production keys go live only after DNS is verified.</p>

<h2>Privacy and expectations</h2>
<p>Forms collect personal data. We align copy with your privacy policy, minimize fields to what sales actually uses, and avoid shipping attachments until virus scanning is accounted for.</p>
<p>GDPR-style consent checkboxes appear when your counsel requires them—not as decoration on every U.S. services site, but deliberately when they should.</p>

<h2>After launch</h2>
<p>We test submissions from mobile networks and corporate VPNs, then monitor bounce rates the first week. Small copy tweaks (“We respond within one business day”) reduce duplicate follow-ups and set trust before the first reply.</p>`,
  },
  {
    title: "Maintaining your Next.js site after launch",
    slug: "maintaining-nextjs-site-after-launch",
    categories: ["Next.js", "DevOps"],
    body: `<p>Launch day is a milestone, not the end of the project. Modern Next.js apps on Vercel stay healthy with dependency updates, monitoring, and a light content cadence from your team.</p>
<p>We set up clients so routine work does not require a developer for every headline change—while engineering time focuses on features that move revenue.</p>

<h2>What “maintenance” actually includes</h2>
<ul>
<li><strong>Framework and library updates</strong> on a schedule, not only when something breaks</li>
<li><strong>Security patches</strong> for auth, forms, and upload endpoints</li>
<li><strong>Uptime and error monitoring</strong> with alerts that reach someone who can act</li>
<li><strong>Backups and migration discipline</strong> when the database schema evolves</li>
</ul>
<p>Neglecting updates for a year often means a painful catch-up sprint; quarterly check-ins keep diffs small and testable.</p>

<h2>Content vs. code changes</h2>
<p>Marketing edits—blog posts, page sections, navigation order—should flow through the CMS dashboard. Code changes—new integrations, authenticated areas, pricing calculators—belong in a tracked backlog with staging previews.</p>
<p>Drawing that line early prevents “quick HTML tweaks” in production that bypass review.</p>

<h2>Performance regressions</h2>
<p>New scripts, hero videos, and third-party widgets are the usual suspects when Core Web Vitals slip. We baseline metrics at launch and re-check after major campaigns or plugin additions.</p>
<blockquote>A fast site is a feature you can lose one marketing tag at a time.</blockquote>

<h2>When to engage us post-launch</h2>
<p>Many clients keep a small retainer for security updates and feature sprints; others call us for quarterly health checks. Either works if someone owns the calendar entry—maintenance deferred is maintenance multiplied.</p>`,
  },
  {
    title: "Rebuild or refresh? How we help you decide",
    slug: "rebuild-or-refresh-your-website",
    categories: ["Strategy", "Planning"],
    body: `<p>Not every dated website needs a ground-up rewrite. Sometimes a focused refresh—new front end on the same content model—delivers most of the value in half the time.</p>
<p>We compare options against your goals, budget, and how much legacy content and integrations must survive the transition.</p>

<h2>Signals a refresh may be enough</h2>
<ul>
<li>Content structure still matches how you sell and support customers</li>
<li>Backend integrations are stable; pain is mostly visual or mobile UX</li>
<li>SEO equity lives in URLs you can redirect one-to-one</li>
<li>Team needs better editing tools more than new product features</li>
</ul>
<p>A refresh often means new templates, improved performance, and a CMS—while preserving slugs and analytics history.</p>

<h2>Signals you likely need a rebuild</h2>
<ul>
<li>Multiple plugins duplicate the same data or break on every update</li>
<li>Staff maintain parallel spreadsheets because the site cannot model workflows</li>
<li>Security or compliance requirements outgrew the original stack</li>
<li>You are merging brands, locales, or product lines into one platform</li>
</ul>
<p>Rebuilds cost more upfront but remove structural debt that refreshes would paper over.</p>

<h2>Hybrid approaches we use</h2>
<p>Strangler patterns work well: launch a new marketing site on Next.js, keep a legacy app on a subdomain temporarily, migrate authenticated users when the new auth model is proven.</p>
<p>That avoids a big-bang cutover that marketing and sales dread.</p>

<h2>How we estimate</h2>
<p>We review analytics, crawl sitemaps, and inventory integrations before quoting. You get a recommendation with trade-offs—not a default “always rebuild” answer because that is how we bill.</p>
<p>The right choice is the smallest project that meets your next twelve months of goals.</p>`,
  },
  {
    title: "Connecting your website to CRM, email, and scheduling tools",
    slug: "website-integrations-crm-email-scheduling",
    categories: ["Product", "Web Development"],
    body: `<p>Websites generate interest; downstream tools close deals. We connect forms, CTAs, and product events to the systems your sales and success teams already live in.</p>
<p>Done well, integrations reduce manual copy-paste and give marketing believable attribution. Done poorly, they leak duplicates and break when someone rotates an API key.</p>

<h2>Common integration patterns</h2>
<ul>
<li><strong>CRM lead creation</strong> when a contact or demo form submits</li>
<li><strong>Newsletter signup</strong> with double opt-in where regulations require it</li>
<li><strong>Scheduling embeds</strong> that pass UTM parameters into booking notes</li>
<li><strong>Webhooks</strong> from payment or trial flows into Slack or support queues</li>
</ul>
<p>We prefer server-side calls so secrets never ship to the browser, and we log failures for replay when a vendor times out.</p>

<h2>Data mapping and duplicates</h2>
<p>Before writing code, we agree on field mapping: which form answers become CRM properties, how to dedupe by email, and what happens when the CRM is down—queue, retry, or alert a human.</p>
<p>Marketing wants every field; sales wants clean records. The mapping conversation aligns both sides early.</p>

<h2>Staging vs. production sandboxes</h2>
<p>Most SaaS tools offer test workspaces. We wire staging forms to sandbox APIs so QA does not pollute real pipelines. Cutover is a config swap, not a rewrite.</p>

<h2>Ownership after handoff</h2>
<p>We document which API keys live in Vercel, who rotates them, and which dashboard shows failed deliveries. Integrations are living systems—not set-and-forget wiring.</p>
<p>When your site and CRM agree on what a lead is, your team spends time closing—not reconciling spreadsheets.</p>`,
  },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const author = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
    columns: { id: true, email: true },
  });

  if (!author) {
    throw new Error("No admin user found. Register an admin account first.");
  }

  console.log(`Using author: ${author.email ?? author.id}`);

  for (const sample of samplePosts) {
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, sample.slug),
      columns: { id: true, title: true },
    });

    if (existing) {
      await db
        .update(posts)
        .set({
          body: sample.body,
          categories: sample.categories,
        })
        .where(eq(posts.id, existing.id));
      console.log(`Updated content: ${existing.title}`);
      continue;
    }

    const [inserted] = await db
      .insert(posts)
      .values({
        title: sample.title,
        slug: sample.slug,
        status: "published",
        body: sample.body,
        categories: sample.categories,
        authorId: author.id,
        featuredImageUrl: null,
      })
      .returning({ id: posts.id, title: posts.title });

    console.log(`Created: ${inserted?.title}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
