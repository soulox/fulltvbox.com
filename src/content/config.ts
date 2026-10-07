import { defineCollection, z } from 'astro:content';

const specs = z
  .object({
    releaseYear: z.number().optional(),
    price: z.number().optional(),
    soc: z.string().optional(),
    cpu: z.string().optional(),
    gpu: z.string().optional(),
    ram: z.string().optional(),
    storage: z.string().optional(),
    os: z.string().optional(),
    maxResolution: z.string().optional(),
    hdr: z.array(z.string()).optional(),
    audio: z.array(z.string()).optional(),
    connectivity: z.array(z.string()).optional(),
    ports: z.array(z.string()).optional(),
    remote: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
  })
  .optional();

const reviews = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    rating: z.number().min(1).max(5),
    price: z.number().optional(),
    affiliate: z.string().optional(),
    // Retailer product IDs. scripts/fetch-prices.mjs prices these at build time and any
    // discount becomes a live deal. Find a Best Buy SKU with `npm run prices -- --find-bestbuy "<name>"`.
    asin: z.string().regex(/^[A-Z0-9]{10}$/).optional(),
    bestBuySku: z.number().int().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    specs,
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    author: z.string().optional(),
    // Measured bench results. Only record numbers actually measured on our test
    // unit — they render as a dated results table and are the review's evidence.
    benchmarks: z
      .object({
        testedOn: z.string(),
        results: z.array(
          z.object({ metric: z.string(), value: z.string(), note: z.string().optional() }),
        ),
      })
      .optional(),
    // No longer sold new: the review stays up for owners, but buy CTAs are dropped
    // and readers are pointed at `successor` (a review slug) when set.
    discontinued: z.boolean().default(false),
    successor: z.string().optional(),
  }),
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    category: z.enum([
      'buying-guides',
      'comparisons',
      'cord-cutting',
      'troubleshooting',
      'ai-llm',
      'basics-setup',
      'whats-new',
    ]),
    image: z.string().optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    author: z.string().optional(),
  }),
});

const tutorials = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    duration: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    author: z.string().optional(),
  }),
});

const services = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    category: z.enum(['on-demand', 'live-tv', 'free', 'sports', 'extra']),
    monthlyPrice: z.number(),
    annualPrice: z.number().optional(),
    adTierPrice: z.number().optional(),
    hasAds: z.boolean().default(false),
    hasLiveTV: z.boolean().default(false),
    freeTrial: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    url: z.string(),
    featured: z.boolean().default(false),
  }),
});

const deals = defineCollection({
  type: 'data',
  schema: z
    .object({
      device: z.string().optional(), // review slug
      service: z.string().optional(), // service slug
      retailer: z.string(),
      price: z.number(),
      wasPrice: z.number().optional(),
      // Subscription promos: what `price`/`wasPrice` are per, and how long the promo
      // price lasts ("for 2 months", "first year"). Hardware deals leave both unset.
      period: z.enum(['month', 'year']).optional(),
      term: z.string().optional(),
      promoCode: z.string().optional(),
      url: z.string(),
      badge: z.string().optional(),
      expires: z.string().optional(), // the promo's published end date, when it has one
      // Date the deal was last confirmed on the retailer's or service's own site. A
      // checked deal hides itself 21 days later unless re-confirmed (the weekly deals
      // routine bumps it), so a promo with no published end date can't linger.
      checked: z.string().optional(),
      featured: z.boolean().default(false),
    })
    .refine((d) => !!d.device !== !!d.service, {
      message: 'A deal must reference exactly one of `device` or `service`.',
    }),
});

// Copyable AI prompts for TV/streaming tasks, one page each under /ai/prompts.
// `tools` and `related` are slugs joined in src/lib/prompts.ts, which fails the
// build on an unknown slug (unlike deals, which drop silently).
const prompts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    group: z.enum(['troubleshooting', 'what-to-watch', 'save-money', 'setup-homelab']),
    // The prompt template. `{placeholder}` tokens are highlighted for the reader to fill in.
    prompt: z.string(),
    variables: z.array(z.string()).default([]),
    tools: z.array(z.string()).min(1), // ai-tools slugs
    // The model that produced the example output in the body, and when.
    testedOn: z.object({ model: z.string(), date: z.string() }),
    related: z.array(z.string()).default([]), // guide, tutorial, or review slugs
    author: z.string().optional(),
  }),
});

// Curated AI tool cards for /ai/tools. Editorial notes, not rated reviews.
const aiTools = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    maker: z.string(),
    url: z.string(),
    pricing: z.string(),
    goodFor: z.array(z.string()).min(1),
    onTv: z.string().optional(), // where it runs on TV hardware, if anywhere
    local: z.boolean().default(false), // runs on your own hardware
    privacyNote: z.string(),
    order: z.number().default(100),
    verified: z.string(), // date pricing/privacy facts were last checked
  }),
});

// Editorial verdicts for titles on the /what-to-watch lists, drafted weekly by a cloud
// routine (docs/automation/weekly-verdicts-agent.md). Joined to Netflix titles by
// titleKey(title) in src/lib/top10.ts; a duplicate key fails the build.
const watchVerdicts = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(), // exactly as Netflix lists it, season included ("Wednesday: Season 2")
    kind: z.enum(['movie', 'series']),
    verdict: z.enum(['watch', 'skip', 'depends']),
    take: z.string().max(160),
    sources: z.array(z.string().url()).min(2), // the published reviews it's based on
    checked: z.string(),
  }),
});

export const collections = {
  reviews,
  guides,
  tutorials,
  deals,
  services,
  prompts,
  'ai-tools': aiTools,
  'watch-verdicts': watchVerdicts,
};
