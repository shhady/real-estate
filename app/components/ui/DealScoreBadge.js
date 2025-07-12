import { getDealScoreBadgeText } from '../../utils/dealScoreUtils';

export default function DealScoreBadge({ dealScore, className = '' }) {
  const badgeText = getDealScoreBadgeText(dealScore);
  
  if (!badgeText) {
    return null; // Don't show badge for properties at or above market price
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 ${className}`}>
      <span className="mr-1">🔥</span>
      {badgeText}
    </div>
  );
}

// Alternative compact version for smaller spaces
export function DealScoreBadgeCompact({ dealScore, className = '' }) {
  if (!dealScore || dealScore <= 0) {
    return null;
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 ${className}`}>
      -{dealScore}%
    </span>
  );
}

// Large version for property detail pages
export function DealScoreBadgeLarge({ dealScore, className = '' }) {
  const badgeText = getDealScoreBadgeText(dealScore);
  
  if (!badgeText) {
    return null;
  }

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg ${className}`}>
      <span className="text-lg mr-2">🔥</span>
      <div className="flex flex-col items-center">
        <span className="text-white">{badgeText}</span>
        <span className="text-green-100 text-xs">עסקת זהב!</span>
      </div>
    </div>
  );
} 