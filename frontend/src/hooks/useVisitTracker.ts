import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { visits } from '../api';

export default function useVisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    visits.track(pathname).catch(() => { /* silent */ });
  }, [pathname]);
}
