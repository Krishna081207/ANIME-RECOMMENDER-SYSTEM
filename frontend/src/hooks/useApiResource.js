import { useEffect, useState } from "react";
import { requestApi } from "../api";

export default function useApiResource(path, { delay = 0, body } = {}) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([path, body, attempt]);

  useEffect(() => {
    if (!path) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await requestApi(path, { body, signal: controller.signal });
        if (!controller.signal.aborted) setResult({ key, data });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ key, error: error.message });
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, body, delay, key]);

  const current = result?.key === key ? result : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: Boolean(path && !current),
    retry: () => setAttempt((previous) => previous + 1)
  };
}
