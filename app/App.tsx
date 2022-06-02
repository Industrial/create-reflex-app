import React, { Suspense } from 'react';
import { Cats } from './Cats.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

export const App = () => {
  return (
    <div>
      <h1>Application</h1>
      <p>These are facts about cats:</p>
      <Suspense fallback={<h1>Loading...</h1>}>
        <ErrorBoundary>
          <Cats />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};
