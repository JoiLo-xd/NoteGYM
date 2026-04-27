import { createContext, useContext } from 'react';

export type Variant = 'success' | 'error';

export interface SnackContextType {
  createSnack: (message: string, variant: Variant) => void;
}

export const SnackContext = createContext<SnackContextType | undefined>(undefined);

export const useSnack = (): SnackContextType => {
  const context = useContext(SnackContext);
  if (!context) {
    throw new Error('useSnack must be used within a SnackProvider');
  }
  return context;
};
