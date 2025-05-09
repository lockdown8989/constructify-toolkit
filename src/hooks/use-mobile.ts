
import { useMediaQuery } from './use-media-query';
import { useIsMobile as useIsMobileReact, useIsTablet, useIsSmallScreen, useIsTouchDevice } from './use-mobile.tsx';

export function useIsMobile() {
  return useIsMobileReact();
}

// Re-export hooks from the tsx version
export { useIsTablet, useIsSmallScreen, useIsTouchDevice };
