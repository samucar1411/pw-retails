import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { resolvedTheme } = useNextTheme();
  return { theme: resolvedTheme };
}
