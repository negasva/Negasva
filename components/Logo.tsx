'use client';

import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ href = '/', className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const content = (
    <span className={`${sizeClasses[size]} tracking-tighter inline-block`}>
      <span className="font-black text-secondary">NEGAS</span>
      <span className="font-medium text-secondary">VA</span>
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
