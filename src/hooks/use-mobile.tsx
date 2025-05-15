
import * as React from "react"

// Defining breakpoints for different device sizes
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const LARGE_TABLET_BREAKPOINT = 1366

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

export function useIsLargeTablet() {
  const [isLargeTablet, setIsLargeTablet] = React.useState<boolean>(() => 
    typeof window !== "undefined" 
      ? window.innerWidth >= TABLET_BREAKPOINT && window.innerWidth <= LARGE_TABLET_BREAKPOINT 
      : false
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const checkLargeTablet = () => {
      setIsLargeTablet(
        window.innerWidth >= TABLET_BREAKPOINT && window.innerWidth <= LARGE_TABLET_BREAKPOINT
      )
    }
    
    window.addEventListener("resize", checkLargeTablet)
    checkLargeTablet()
    
    return () => window.removeEventListener("resize", checkLargeTablet)
  }, [])

  return isLargeTablet
}

export function useIsAnyTablet() {
  const isTablet = useIsTablet()
  const isLargeTablet = useIsLargeTablet()
  return isTablet || isLargeTablet
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

// Check current orientation
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>(
    typeof window !== "undefined" 
      ? window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      : 'portrait'
  )

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }
    
    window.addEventListener("resize", updateOrientation)
    updateOrientation()
    
    return () => window.removeEventListener("resize", updateOrientation)
  }, [])

  return orientation
}
