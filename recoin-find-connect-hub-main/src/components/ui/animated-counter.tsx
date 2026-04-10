import React from "react";
import CountUp from "react-countup";

interface AnimatedCounterProps {
  end: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
}) => (
  <CountUp
    end={end}
    decimals={decimals}
    suffix={suffix}
    prefix={prefix}
    duration={duration}
    enableScrollSpy
    scrollSpyOnce
    className={className}
  />
);

export default AnimatedCounter;
