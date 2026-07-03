import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const [reviews, guides] = await Promise.all([
    getCollection('reviews'),
    getCollection('guides'),
  ]);

  const items = [
    ...reviews.map(review => ({
      title: review.data.title,
      pubDate: new Date(review.data.publishDate),
      description: review.data.description,
      link: `/reviews/${review.slug}/`,
    })),
    ...guides.map(guide => ({
      title: guide.data.title,
      pubDate: new Date(guide.data.publishDate),
      description: guide.data.description,
      link: `/guides/${guide.slug}/`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'FullTVBox — TV Box Reviews & Guides',
    description: 'Expert TV box reviews, comparisons, and setup guides.',
    site: context.site!,
    items,
  });
}
