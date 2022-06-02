import React from 'react';
import { fetchData } from './lib/suspense.ts';

type CatData = {
  data: Array<{
    fact: string;
    length: string;
  }>;
};

const data = fetchData<CatData>('https://catfact.ninja/facts');

export const Cats = () => {
  const cats = data.read();

  return (
    <ul>
      {cats.data.map((cat, i) => <li key={`${i}-${cat.length}`}>{cat.fact}
      </li>)}
    </ul>
  );
};
