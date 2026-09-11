import { useContext } from 'react';
import { MitraDataContext } from '../context/mitraDataContextObject';

export function useMitraData() {
  const ctx = useContext(MitraDataContext);
  if (!ctx) {
    throw new Error('useMitraData harus dipakai di dalam <MitraDataProvider>');
  }
  return ctx;
}