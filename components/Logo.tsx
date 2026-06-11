'use client';

import { memo } from 'react';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

function Logo({ href = '/', className = '', size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const textClass = variant === 'light' ? 'text-cream' : 'text-secondary';

  const content = (
    <span className={`${sizeClasses[size]} tracking-tighter inline-block`}>
      <span className={`font-black ${textClass}`}>NEGAS</span>
      <span className={`font-normal ${textClass}`}>VA</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={className || ''}>
        {content}
      </Link>
    );
  }

  return <div className={className || ''}>{content}</div>;
}

export default memo(Logo);
