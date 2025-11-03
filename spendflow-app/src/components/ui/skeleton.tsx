import { cn } from "@/lib/utils"

interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  variant?: 'default' | 'card' | 'table' | 'text';
  lines?: number;
  className?: string;
}

function Skeleton({ variant = 'default', lines = 1, className, ...props }: SkeletonProps) {
  if (variant === 'card') {
    return <CardSkeleton className={className} {...props} />;
  }

  if (variant === 'table') {
    return <TableSkeleton className={className} {...props} />;
  }

  if (variant === 'text') {
    return <TextSkeleton lines={lines} className={className} {...props} />;
  }

  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/50", className)}
      {...props}
    />
  );
}

// Card skeleton for dashboard cards, user profiles, etc.
function CardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-lg p-6', className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

// Table skeleton for data tables
function TableSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden', className)} {...props}>
      {/* Table Header */}
      <div className="border-b border-slate-800 px-6 py-3">
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="h-4 w-20 col-span-3" />
          <Skeleton className="h-4 w-24 col-span-3" />
          <Skeleton className="h-4 w-16 col-span-2" />
          <Skeleton className="h-4 w-18 col-span-3" />
          <Skeleton className="h-4 w-12 col-span-1" />
        </div>
      </div>
      {/* Table Rows */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b border-slate-800 px-6 py-4 last:border-b-0">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 col-span-3" />
            <Skeleton className="h-4 w-16 col-span-2" />
            <Skeleton className="h-4 w-24 col-span-3" />
            <Skeleton className="h-6 w-16 rounded-full col-span-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Text skeleton for paragraphs, descriptions, etc.
function TextSkeleton({ lines = 3, className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full' // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

// Specialized skeletons for specific use cases
export function TransactionSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-lg p-4', className)} {...props}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-lg p-6', className)} {...props}>
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-lg p-6', className)} {...props}>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

// Loading overlay component
export function LoadingOverlay({ message = 'Loading...', className, ...props }: {
  message?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center',
        className
      )}
      {...props}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center max-w-sm mx-4">
        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-slate-200 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Inline loading spinner
export function LoadingSpinner({ size = 'md', className, ...props }: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-slate-600 border-t-amber-500',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton }
