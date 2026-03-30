const mockMovies = [
  { externalMovieId: 101, title: 'Rocky', releaseYear: 1976, description: 'A small-time boxer gets a rare chance to fight a heavyweight champion.' },
  { externalMovieId: 102, title: 'Raging Bull', releaseYear: 1980, description: 'The story of boxer Jake LaMotta and his rise and struggles.' },
  { externalMovieId: 103, title: 'Roman Holiday', releaseYear: 1953, description: 'A princess explores Rome with an American reporter.' },
  { externalMovieId: 104, title: 'Rush Hour', releaseYear: 1998, description: 'A mismatched pair of cops work together on a kidnapping case.' },
  { externalMovieId: 105, title: 'Raiders of the Lost Ark', releaseYear: 1981, description: 'Indiana Jones races to recover a legendary artifact.' },
  { externalMovieId: 106, title: 'The Batman', releaseYear: 2022, description: 'Batman investigates corruption in Gotham City.' },
  { externalMovieId: 107, title: 'Titanic', releaseYear: 1997, description: 'A romance unfolds aboard the ill-fated Titanic.' },
  { externalMovieId: 108, title: 'Top Gun', releaseYear: 1986, description: 'A hotshot pilot trains at the Navy Fighter Weapons School.' },
  { externalMovieId: 109, title: 'Interstellar', releaseYear: 2014, description: 'A team travels through a wormhole to save humanity.' },
  { externalMovieId: 110, title: 'Inception', releaseYear: 2010, description: 'A thief enters dreams to plant an idea in a target’s mind.' },
  { externalMovieId: 111, title: 'Gladiator', releaseYear: 2000, description: 'A betrayed Roman general fights for justice in the arena.' },
  { externalMovieId: 112, title: 'Gravity', releaseYear: 2013, description: 'Astronauts struggle to survive after disaster in orbit.' },
  { externalMovieId: 113, title: 'Goodfellas', releaseYear: 1990, description: 'The rise and fall of a mob associate.' },
  { externalMovieId: 114, title: 'Gone Girl', releaseYear: 2014, description: 'A man becomes the center of media attention after his wife disappears.' },
  { externalMovieId: 115, title: 'Casablanca', releaseYear: 1942, description: 'A nightclub owner faces love and sacrifice during wartime.' },
  { externalMovieId: 116, title: 'Creed', releaseYear: 2015, description: 'Apollo Creed’s son trains under Rocky Balboa.' },
  { externalMovieId: 117, title: 'Cinderella Man', releaseYear: 2005, description: 'A boxer returns to the ring during the Great Depression.' },
  { externalMovieId: 118, title: 'Avatar', releaseYear: 2009, description: 'A marine enters the world of Pandora and its people.' },
  { externalMovieId: 119, title: 'Alien', releaseYear: 1979, description: 'A deadly creature hunts a spaceship crew.' },
  { externalMovieId: 120, title: 'Amelie', releaseYear: 2001, description: 'A young woman quietly improves the lives of those around her.' },
];

export async function getTrendingMovies() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return mockMovies.slice(0, 20);
}

export async function searchMovies(query) {
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (!query.trim()) {
    return getTrendingMovies();
  }

  const lowerQuery = query.toLowerCase();

  return mockMovies
    .filter((movie) => movie.title.toLowerCase().includes(lowerQuery))
    .slice(0, 20);
}
