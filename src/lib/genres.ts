// Fixed genre vocabulary for /what-to-watch titles. A closed list (rather than free text)
// keeps "Sci-Fi", "sci fi" and "Science Fiction" from becoming three genres, so genre
// pages can be built from it later. Add a genre here before using it in a verdict file.
export const GENRES = {
  action: 'Action',
  adventure: 'Adventure',
  animation: 'Animation',
  anime: 'Anime',
  biography: 'Biography',
  comedy: 'Comedy',
  crime: 'Crime',
  documentary: 'Documentary',
  drama: 'Drama',
  family: 'Family',
  fantasy: 'Fantasy',
  history: 'History',
  horror: 'Horror',
  kids: 'Kids',
  music: 'Music',
  mystery: 'Mystery',
  reality: 'Reality',
  romance: 'Romance',
  'sci-fi': 'Sci-Fi',
  sport: 'Sport',
  'stand-up': 'Stand-Up',
  thriller: 'Thriller',
  'true-crime': 'True Crime',
  war: 'War',
  western: 'Western',
} as const;

export type Genre = keyof typeof GENRES;
export const GENRE_IDS = Object.keys(GENRES) as [Genre, ...Genre[]];
