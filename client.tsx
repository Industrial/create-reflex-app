import React from 'react';
import { ReactStreaming } from 'react-streaming/client';

import { App } from './app/App.tsx';

export const ClientApplication = () => {
  return (
    <ReactStreaming>
      <App />
    </ReactStreaming>
  );
};
