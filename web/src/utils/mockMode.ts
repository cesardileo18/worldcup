const MOCK_MODE_KEY = 'worldcup-2026:mock-mode';

export const isMockModeEnabled = (): boolean => {
  if (import.meta.env.VITE_USE_MOCK_MATCHES === 'true') {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const mockParam = params.get('mock');

  if (mockParam === '1' || mockParam === 'true') {
    localStorage.setItem(MOCK_MODE_KEY, 'true');
    return true;
  }

  if (mockParam === '0' || mockParam === 'false') {
    localStorage.removeItem(MOCK_MODE_KEY);
    return false;
  }

  return localStorage.getItem(MOCK_MODE_KEY) === 'true';
};
