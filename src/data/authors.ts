// Author / editorial-entity registry. Single source of truth for bylines and
// author structured data. Forward-compatible: add real Person entries here
// later (with bio + sameAs) and set `author: <slug>` in a review/guide/tutorial.

export interface Author {
  slug: string;
  /** schema.org type — Organization for the editorial team, Person for named writers */
  type: 'Person' | 'Organization';
  name: string;
  role: string;
  bio: string;
  /** authority page for this author (absolute or site-relative) */
  url: string;
  image?: string;
  /** profile URLs (LinkedIn, X, etc.) — becomes schema.org sameAs */
  sameAs?: string[];
}

export const authors: Record<string, Author> = {
  'test-bench': {
    slug: 'test-bench',
    type: 'Organization',
    name: 'FullTVBox Test Bench',
    role: 'Editorial test team',
    bio: 'The FullTVBox Test Bench is our in-house review team. Every device is bought or borrowed and put through at least two weeks of real-world testing against a fixed set of criteria — no manufacturer influence, no sponsored rankings.',
    url: '/about',
  },
};

export const DEFAULT_AUTHOR = 'test-bench';

export function getAuthor(slug?: string): Author {
  return (slug && authors[slug]) || authors[DEFAULT_AUTHOR];
}

/** Build a schema.org author node, resolving the authority/image URLs against `site`. */
export function authorJsonLd(author: Author, site: URL | undefined) {
  return {
    '@type': author.type,
    name: author.name,
    description: author.bio,
    url: new URL(author.url, site).href,
    ...(author.image ? { image: new URL(author.image, site).href } : {}),
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  };
}
