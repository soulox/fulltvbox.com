import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getWeeklyChanges, netflixLatestWeek, weekLabel } from '../lib/top10';

/** One item per Netflix week, so feed readers see each week's new Top 10 entries. */
async function newThisWeekItem() {
  const week = netflixLatestWeek('us');
  if (!week) return [];
  const lists = await Promise.all([getWeeklyChanges('us', 'movie'), getWeeklyChanges('us', 'series')]);
  const titles = lists.flatMap((l) => l.entries).filter((t) => t.change?.type === 'new').map((t) => t.title);
  return [{
    title: `New on Netflix this week (${weekLabel(week)})`,
    // Netflix publishes each Sunday-ending week on the Tuesday after.
    pubDate: new Date(new Date(`${week}T00:00:00Z`).getTime() + 2 * 86_400_000),
    description: titles.length ? `New in Netflix's US Top 10: ${titles.join(', ')}.` : "This week's changes in Netflix's US Top 10.",
    link: `/what-to-watch/new-this-week#week-${week}`,
  }];
}

export async function GET(context: APIContext) {
  const [reviews, guides, watchItems] = await Promise.all([
    getCollection('reviews'),
    getCollection('guides'),
    newThisWeekItem(),
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
    ...watchItems,
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'FullTVBox — TV Box Reviews & Guides',
    description: 'Expert TV box reviews, comparisons, and setup guides.',
    site: context.site!,
    items,
  });
}
