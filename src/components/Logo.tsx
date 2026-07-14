import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', light = false }) => {
  return (
    <Link href="/" className={`flex items-center gap-2 select-none group ${className}`}>
      {/* SVG Icon */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-500 group-hover:rotate-12"
      >
        {/* Leaf 1 (Dark Green) */}
        <path
          d="M50 20C50 20 20 35 20 60C20 80 40 85 50 85C50 85 50 50 50 20Z"
          fill="#0A4B2A"
        />
        {/* Leaf 2 (Primary Green) */}
        <path
          d="M50 20C50 20 80 35 80 60C80 80 60 85 50 85C50 85 50 50 50 20Z"
          fill="#00A651"
        />
        {/* Bright Accent Spark/Orange Droplet (Simulating freshness & speed) */}
        <path
          d="M50 35C58 45 68 55 60 70C52 80 40 78 40 70C40 60 46 45 50 35Z"
          fill="#FF6B00"
        />
        {/* Secondary Green Vein */}
        <path
          d="M50 85C50 85 50 70 55 50C60 30 50 20 50 20"
          stroke="#F7931E"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Inner circle glowing core */}
        <circle cx="50" cy="65" r="5" fill="#FFFFFF" />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-display text-xl font-extrabold tracking-tight transition-colors duration-300 ${
            light ? 'text-white' : 'text-neutral-dark'
          }`}
        >
          Pure <span className="text-primary">O</span>
          <span className="text-accent"> Fresh</span>
        </span>
        <span
          className={`text-[9px] font-semibold tracking-[0.15em] uppercase mt-0.5 ${
            light ? 'text-green-200' : 'text-primary-dark/80'
          }`}
        >
          Organic Delivery
        </span>
      </div>
    </Link>
  );
};
export default Logo;
