
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useMediaQuery } from "@/hooks/use-media-query";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isSmallMobile = useMediaQuery('(max-width: 360px)');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getClockSize = () => {
    if (isSmallMobile) {
      return "text-5xl";
    }
    if (isMobile) {
      return isLandscape ? "text-6xl" : "text-5xl";
    }
    return isLandscape ? "text-8xl" : "text-7xl";
  };

  return (
    <div className={`digital-clock ${getClockSize()} font-mono font-bold text-white`}>
      {format(time, "HH:mm:ss")}
    </div>
  );
};

export default DigitalClock;
