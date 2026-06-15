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
    image: z.string().optional(),
    affiliate: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    specs,
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  }),
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    image: z.string().optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
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
      url: z.string(),
      badge: z.string().optional(),
      expires: z.string().optional(),
      featured: z.boolean().default(false),
    })
    .refine((d) => !!d.device !== !!d.service, {
      message: 'A deal must reference exactly one of `device` or `service`.',
    }),
});

export const collections = { reviews, guides, tutorials, deals, services };
