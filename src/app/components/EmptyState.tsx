import { type LucideIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Shared empty-state component.
 * Use variant="no-results" by passing a "Clear Filters" action.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icon circle */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-full mb-5"
        style={{ backgroundColor: 'rgba(190,34,14,0.08)' }}
      >
        <Icon size={36} style={{ color: '#BE220E' }} strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      )}

      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
          className="border-[#BE220E] text-[#BE220E] hover:bg-[#BE220E] hover:text-white transition-colors"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
