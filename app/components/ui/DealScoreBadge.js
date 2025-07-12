import { getDealScoreBadgeInfo } from '../../utils/dealScoreUtils';

export default function DealScoreBadge({ dealScore, className = '' }) {
  const badgeInfo = getDealScoreBadgeInfo(dealScore);
  
  if (!badgeInfo) {
    return null; // Don't show badge for properties below 70% deal score
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeInfo.colorClass} ${className}`}>
      {badgeInfo.text}
    </div>
  );
}

// Alternative compact version for smaller spaces
export function DealScoreBadgeCompact({ dealScore, className = '' }) {
  const badgeInfo = getDealScoreBadgeInfo(dealScore);
  
  if (!badgeInfo) {
    return null;
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${badgeInfo.colorClass} ${className}`}>
      {badgeInfo.text}
    </span>
  );
}

// Large version for property detail pages
export function DealScoreBadgeLarge({ dealScore, className = '' }) {
  const badgeInfo = getDealScoreBadgeInfo(dealScore);
  
  if (!badgeInfo) {
    return null;
  }

  // Determine gradient colors based on score
  const gradientClass = dealScore >= 80 
    ? 'from-green-400 to-green-600' 
    : 'from-yellow-400 to-yellow-600';
  
  const textColor = dealScore >= 80 ? 'text-white' : 'text-yellow-900';
  const subTextColor = dealScore >= 80 ? 'text-green-100' : 'text-yellow-800';

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r ${gradientClass} ${textColor} shadow-lg ${className}`}>
      <div className="flex flex-col items-center">
        <span className={textColor}>{badgeInfo.text}</span>
        <span className={`${subTextColor} text-xs`}>
          {dealScore >= 80 ? 'עסקת זהב!' : 'הזדמנות טובה!'}
        </span>
      </div>
    </div>
  );
} 