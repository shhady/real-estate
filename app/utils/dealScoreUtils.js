/**
 * Client-side deal score utilities
 * These functions don't require server-side models and can be used in client components
 */

/**
 * Get formatted deal score badge text in Hebrew
 */
export function getDealScoreBadgeText(dealScore) {
  if (!dealScore || dealScore <= 0) {
    return null; // No badge for properties at or above market price
  }
  
  return `נמוך ממחיר שוק ב-${dealScore}%`;
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