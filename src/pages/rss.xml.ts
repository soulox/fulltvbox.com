import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const reviews = await getCollection('reviews');
  const sorted = reviews.sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );
  return rss({
    title: 'FullTVBox — TV Box Reviews',
    description: 'Expert TV box reviews, comparisons, and setup guides.',
    site: context.site!,
    items: sorted.map(review => ({
      title: review.data.title,
      pubDate: new Date(review.data.publishDate),
      description: review.data.description,
      link: `/reviews/${review.slug}/`,
    })),
  });
}
