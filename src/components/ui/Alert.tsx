import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'error' | 'info';

interface AlertProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const TONES: Record<Tone, string> = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-amber-50 text-amber-900 ring-amber-200',
};

export function Alert({ tone = 'error', children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg px-4 py-3 text-sm ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
