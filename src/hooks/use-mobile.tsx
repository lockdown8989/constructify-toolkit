
import * as React from "react"

// Defining breakpoints for different device sizes
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => 
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener
    window.addEventListener("resize", checkMobile)
    
    // Initial check
    checkMobile()
    
    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(() => 
    typeof window !== "undefined" 
      ? window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT 
      : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkTablet = () => {
      setIsTablet(
        window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
      )
    }
    
    window.addEventListener("resize", checkTablet)
    checkTablet()
    
    return () => window.removeEventListener("resize", checkTablet)
  }, [])

  return isTablet
}

export function useIsSmallScreen() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  return isMobile || isTablet
}

// Hook to detect if device has touch capabilities
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    if (typeof window === "undefined") return
    
    const hasTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 ||
                    (navigator as any).msMaxTouchPoints > 0
    
    setIsTouch(hasTouch)
  }, [])
  
  return isTouch
}

// Calendar-specific hook for handling swipe gestures
export function useCalendarSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
) {
  const touchStart = React.useRef<number | null>(null);
  const isTouch = useIsTouchDevice();

  const handleTouchStart = React.useCallback((e: React.TouchEvent | TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = React.useCallback((e: React.TouchEvent | TouchEvent) => {
    if (touchStart.current === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
    
    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  const touchProps = React.useMemo(() => {
    if (!isTouch) return {};
    
    return {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    };
  }, [isTouch, handleTouchStart, handleTouchEnd]);

  return {
    touchProps,
    isTouch
  };
}
