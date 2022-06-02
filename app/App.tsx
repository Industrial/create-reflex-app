// import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import React, { Suspense } from 'react';

// export const CatFacts = () => {
//   const { isLoading, error, data } = useQuery('catFacts', async () => {
//     const result = await fetch('https://catfact.ninja/cats');
//     const resultJSON = await result.json();
//     return resultJSON;
//   });

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error!</div>;
//   }

//   return (
//     <div>
//       <h1>{data.name}</h1>
//       <p>{data.description}</p>
//       <p>{data.html_url}</p>
//     </div>
//   );
// };

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       suspense: true,
//     },
//   },
// });

export const App = () => {
  return (
    <div>
      <h1>Application</h1>
      <p>These are facts about cats:</p>
    </div>
  );
};
