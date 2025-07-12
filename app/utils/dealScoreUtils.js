/**
 * Client-side deal score utilities
 * These functions don't require server-side models and can be used in client components
 */

/**
 * Get formatted deal score badge text and style based on deal score
 */
export function getDealScoreBadgeInfo(dealScore) {
  if (!dealScore || dealScore < 70) {
    return null; // No badge for properties below 70% deal score
  }
  
  if (dealScore >= 80) {
    return {
      text: `מחיר אטרקטיבי`,
      colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
  } else if (dealScore >= 70) {
    return {
      text: ` נמוך ממחיר שוק ב-${100 - dealScore}% 🔥`,
      colorClass: 'bg-green-100 text-green-800 border-green-200'
    };
  }
  
  return null;
}

/**
 * Get formatted deal score badge text in Hebrew (legacy function for backward compatibility)
 */
export function getDealScoreBadgeText(dealScore) {
  const badgeInfo = getDealScoreBadgeInfo(dealScore);
  return badgeInfo ? badgeInfo.text : null;
}

/**
 * Check if a property needs deal score recalculation
 * Recalculate if: no score exists, score is older than 7 days, or price/area changed recently
 */
export function needsDealScoreRecalculation(property) {
  if (!property.dealScore || !property.dealScoreCalculatedAt) {
    return true; // Never calculated
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (property.dealScoreCalculatedAt < oneWeekAgo) {
    return true; // Older than one week
  }

  // Check if price or area was updated after last calculation
  if (property.updatedAt > property.dealScoreCalculatedAt) {
    return true; // Property was updated after last calculation
  }

  return false;
} 