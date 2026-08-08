
// src/context/ReportCacheContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { reportAPI } from '../services/api';

const ReportCacheContext = createContext(null);
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function ReportCacheProvider({ children }) {
  const [report, setReport] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [lastFetched, setLastFetched] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback((force = false) => {
    const isStale = !lastFetched || (Date.now() - lastFetched > CACHE_TTL);
    if (!force && !isStale && report) return; // cache is fresh, do nothing

    if (!report) setLoading(true); // spinner only on very first load
    Promise.all([reportAPI.getWeekly(), reportAPI.getMonthly()])
      .then(([weeklyRes, monthlyRes]) => {
        setReport(weeklyRes);
        setMonthly(monthlyRes.months);
        setLastFetched(Date.now());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lastFetched, report]);

  return (
    <ReportCacheContext.Provider value={{ report, monthly, loading, fetchReport }}>
      {children}
    </ReportCacheContext.Provider>
  );
}

export function useReportCache() {
  return useContext(ReportCacheContext);
}
