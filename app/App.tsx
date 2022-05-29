import { useAsync } from 'react-streaming';
import React from 'react';

export const App = () => {
  console.log('Rendering App');

  const movies = useAsync(async () => {
    const response = await fetch('https://catfact.ninja/facts');
    return response.json();
  });
  console.log('movies', movies);

  return <h1>These are facts about cats.</h1>;
};
