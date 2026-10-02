export interface PropertyInput {
  id: string;
  propertyId: string;
  type: string;        // "APARTMENT" | "VILLA" | "OFFICE" | "SHOP" | "LAND"
  listingType: string; // "SALE" | "RENT"
  address: string;
  area: number;
  bedrooms?: number | null;
  furnished: boolean;
  price: number;
}

export interface RequirementInput {
  listingType: string;
  type: string;
  preferredAreas: string; // JSON array of string areas
  minBudget?: number | null;
  maxBudget?: number | null;
  minArea?: number | null;
  bedrooms?: number | null;
  furnished?: boolean | null;
}

export interface MatchResult {
  score: number; // 0 to 100
  breakdown: {
    listingType: number;
    propertyType: number;
    location: number;
    budget: number;
    area: number;
    bedrooms: number;
    furnished: number;
  };
}

function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[أإآا]/g, "ا") // Normalize Alif
    .replace(/ة/g, "ه") // Normalize Taa Marbouta to Haa
    .replace(/[يى]/g, "ي") // Normalize Alif Maqsura to Yaa
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

/**
 * Calculates a match score between a property listing and a client's requirements.
 * Score is between 0 and 100.
 */
export function calculateMatchScore(
  property: PropertyInput,
  requirement: RequirementInput
): MatchResult {
  const result: MatchResult = {
    score: 0,
    breakdown: {
      listingType: 0,
      propertyType: 0,
      location: 0,
      budget: 0,
      area: 0,
      bedrooms: 0,
      furnished: 0,
    },
  };

  // 1. Strict Filters: Listing Type (Sale vs Rent) and Property Type (Apartment vs Villa etc.)
  // Must match exactly. If they don't, match is 0.
  if (property.listingType.toUpperCase() !== requirement.listingType.toUpperCase()) {
    return result;
  }
  result.breakdown.listingType = 1;

  if (property.type.toUpperCase() !== requirement.type.toUpperCase()) {
    return result;
  }
  result.breakdown.propertyType = 1;

  let totalScore = 0;

  // 2. Location Match (Weight: 30%)
  // Parse preferred areas. If empty or contains "*", assign full score.
  let locationPoints = 0;
  let isLocationMatch = false;
  try {
    const areas: string[] = JSON.parse(requirement.preferredAreas || "[]");
    if (areas.length === 0) {
      locationPoints = 30; // No preference means any location matches
      isLocationMatch = true;
    } else {
      const propAddressNorm = normalizeArabic(property.address);
      const hasMatch = areas.some((area) => {
        const areaNorm = normalizeArabic(area);
        return propAddressNorm.includes(areaNorm) || areaNorm.includes(propAddressNorm);
      });
      if (hasMatch) {
        locationPoints = 30;
        isLocationMatch = true;
      }
    }
  } catch (e) {
    // If invalid JSON, treat as string search
    const reqAreaStr = normalizeArabic(String(requirement.preferredAreas || ""));
    const propAddressNorm = normalizeArabic(property.address);
    if (!reqAreaStr || propAddressNorm.includes(reqAreaStr)) {
      locationPoints = 30;
      isLocationMatch = true;
    }
  }
  
  if (!isLocationMatch) {
    return result; // Strict: Must match location
  }
  
  result.breakdown.location = Math.round((locationPoints / 30) * 100);
  totalScore += locationPoints;

  // 3. Budget Match (Weight: 30%)
  let budgetPoints = 30;
  let isBudgetMatch = true;
  let minBudget = requirement.minBudget;
  let maxBudget = requirement.maxBudget;
  
  if (minBudget && maxBudget && minBudget > maxBudget) {
    const temp = minBudget;
    minBudget = maxBudget;
    maxBudget = temp;
  }

  if (maxBudget !== undefined && maxBudget !== null && maxBudget > 0) {
    if (property.price <= maxBudget) {
      // Within budget
      if (minBudget !== undefined && minBudget !== null && minBudget > 0) {
        if (property.price >= minBudget) {
          budgetPoints = 30;
        } else {
          // Below min budget (fuzzy matching down to 10% margin)
          const diffPct = (minBudget - property.price) / minBudget;
          if (diffPct <= 0.10) {
            budgetPoints = 30 * (1 - diffPct / 0.10);
          } else {
            isBudgetMatch = false;
          }
        }
      } else {
        budgetPoints = 30;
      }
    } else {
      // Exceeds budget (fuzzy matching up to 5% margin)
      const diffPct = (property.price - maxBudget) / maxBudget;
      if (diffPct <= 0.05) {
        budgetPoints = 30 * (1 - diffPct / 0.05);
      } else {
        isBudgetMatch = false;
      }
    }
  } else if (minBudget !== undefined && minBudget !== null && minBudget > 0) {
    if (property.price >= minBudget) {
      budgetPoints = 30;
    } else {
      // Below min budget fuzzy
      const diffPct = (minBudget - property.price) / minBudget;
      if (diffPct <= 0.10) {
        budgetPoints = 30 * (1 - diffPct / 0.10);
      } else {
        isBudgetMatch = false;
      }
    }
  }
  
  if (!isBudgetMatch) {
    return result; // Strict: Must be within budget range
  }
  
  result.breakdown.budget = Math.round((budgetPoints / 30) * 100);
  totalScore += budgetPoints;

  // 4. Area Match (Weight: 20%)
  let areaPoints = 20;
  const minArea = requirement.minArea;
  if (minArea !== undefined && minArea !== null && minArea > 0) {
    if (property.area >= minArea) {
      areaPoints = 20;
    } else {
      // Less area, fuzzy matching down to 25% margin
      const diffPct = (minArea - property.area) / minArea;
      if (diffPct <= 0.25) {
        areaPoints = 20 * (1 - diffPct / 0.25);
      } else {
        areaPoints = 0;
      }
    }
  }
  result.breakdown.area = Math.round((areaPoints / 20) * 100);
  totalScore += areaPoints;

  // 5. Rooms/Bedrooms Match (Weight: 10%)
  let roomsPoints = 10;
  const reqRooms = requirement.bedrooms;
  if (reqRooms !== undefined && reqRooms !== null && reqRooms > 0) {
    const propRooms = property.bedrooms || 0;
    if (propRooms >= reqRooms) {
      roomsPoints = 10;
    } else {
      // Mismatch penalty
      roomsPoints = 0;
    }
  }
  result.breakdown.bedrooms = Math.round((roomsPoints / 10) * 100);
  totalScore += roomsPoints;

  // 6. Furnished Match (Weight: 10%)
  let furnishedPoints = 10;
  const reqFurnished = requirement.furnished;
  if (reqFurnished !== undefined && reqFurnished !== null) {
    if (property.furnished === reqFurnished) {
      furnishedPoints = 10;
    } else {
      furnishedPoints = 0;
    }
  }
  result.breakdown.furnished = Math.round((furnishedPoints / 10) * 100);
  totalScore += furnishedPoints;

  // Final score out of 100
  result.score = Math.round(totalScore);
  return result;
}
