import React from 'react';

export const ChunksContext = React.createContext<ChunkContextType>(undefined);

export type ChunkContextType =
    | undefined
    | {
          registerChunk: (chunkName: string) => void;
      };
