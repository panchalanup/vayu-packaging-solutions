import { PackagingOption, UserInput, ScoredResult } from '@/types/packaging';

export function matchAndScoreOptions(
  data: PackagingOption[],
  input: UserInput
): ScoredResult[] {
  // Step 1: Filter candidates
  let candidates = filterCandidates(data, input);

  if (candidates.length === 0) {
    // Relax constraints if no matches
    candidates = data.filter(
      (item) => item.transport_type === input.transport_type
    );
  }

  // Step 2: Score each candidate
  const scored = candidates.map((item) => scoreOption(item, input));

  // Step 3: Sort by score and get top results
  scored.sort((a, b) => b.score - a.score);

  // Step 4: Assign labels
  const top3 = scored.slice(0, 3);
  if (top3.length >= 3) {
    top3[0].label = 'Best Protection';
    top3[1].label = 'Best Value';
    top3[2].label = 'Economy';
  } else if (top3.length === 2) {
    top3[0].label = 'Best Protection';
    top3[1].label = 'Best Value';
  } else if (top3.length === 1) {
    top3[0].label = 'Best Value';
  }

  return top3;
}

function filterCandidates(
  data: PackagingOption[],
  input: UserInput
): PackagingOption[] {
  return data.filter((item) => {
    // Transport type match
    if (item.transport_type !== input.transport_type) {
      return false;
    }

    // Weight tolerance (±30%)
    if (input.weight_kg) {
      const weightDiff = Math.abs(item.product_weight_kg - input.weight_kg);
      const tolerance = input.weight_kg * 0.3;
      if (weightDiff > tolerance) {
        return false;
      }
    }

    // Dimensions tolerance (±30%)
    if (input.length_mm && input.width_mm && input.height_mm) {
      const lengthDiff = Math.abs(item.product_length_mm - input.length_mm);
      const widthDiff = Math.abs(item.product_width_mm - input.width_mm);
      const heightDiff = Math.abs(item.product_height_mm - input.height_mm);

      const lengthTolerance = input.length_mm * 0.3;
      const widthTolerance = input.width_mm * 0.3;
      const heightTolerance = input.height_mm * 0.3;

      if (
        lengthDiff > lengthTolerance ||
        widthDiff > widthTolerance ||
        heightDiff > heightTolerance
      ) {
        return false;
      }
    }

    // Fragility match (if specified)
    if (input.fragility !== 'Unknown') {
      // High fragility products need High or Medium protection
      if (input.fragility === 'High' && item.fragility_level === 'Low') {
        return false;
      }
    }

    // Price constraint
    if (input.max_price && item.estimated_price_inr > input.max_price) {
      return false;
    }

    return true;
  });
}

function scoreOption(item: PackagingOption, input: UserInput): ScoredResult {
  // Calculate individual scores
  const protectionScore = calculateProtectionScore(item, input);
  const fitScore = calculateFitScore(item, input);
  const costScore = calculateCostScore(item);
  const transportScore = 100; // Already filtered by transport

  // Apply priority weights
  const weights = getPriorityWeights(input.priority);

  const totalScore =
    weights.protection * protectionScore +
    weights.fit * fitScore +
    weights.cost * costScore +
    weights.transport * transportScore;

  // Calculate confidence
  const confidence = calculateConfidence(input);

  // Generate reasons
  const reasons = generateReasons(item, protectionScore, fitScore, costScore);

  return {
    ...item,
    score: totalScore,
    confidence,
    label: 'Best Value', // Will be reassigned later
    reasons,
    fit_score: fitScore,
    protection_score: protectionScore,
    cost_score: costScore,
    transport_score: transportScore,
  };
}

function calculateProtectionScore(
  item: PackagingOption,
  input: UserInput
): number {
  let score = 0;

  // ECT-based score (normalized to 0-100)
  // Typical ECT ranges from 23-72
  score += (item.ECT_lb_per_in / 72) * 50;

  // Board type score
  if (item.board_type === '7-ply') score += 30;
  else if (item.board_type === '5-ply') score += 20;
  else if (item.board_type === '3-ply') score += 10;

  // Internal protection bonus
  if (item.internal_protection.includes('Foam') || 
      item.internal_protection.includes('Molded pulp')) {
    score += 20;
  } else if (item.internal_protection.includes('Bubble wrap') ||
             item.internal_protection.includes('Corrugated dividers')) {
    score += 10;
  }

  return Math.min(score, 100);
}

function calculateFitScore(item: PackagingOption, input: UserInput): number {
  if (!input.length_mm || !input.width_mm || !input.height_mm) {
    return 50; // Default score when dimensions not provided
  }

  const lengthDiff = Math.abs(item.product_length_mm - input.length_mm) / input.length_mm;
  const widthDiff = Math.abs(item.product_width_mm - input.width_mm) / input.width_mm;
  const heightDiff = Math.abs(item.product_height_mm - input.height_mm) / input.height_mm;

  const avgDiff = (lengthDiff + widthDiff + heightDiff) / 3;

  if (avgDiff <= 0.1) return 100; // ±10%
  if (avgDiff <= 0.2) return 80;  // ±20%
  if (avgDiff <= 0.3) return 60;  // ±30%
  return 30;
}

function calculateCostScore(item: PackagingOption): number {
  // Inverse normalize price (lower price = higher score)
  // Assuming price range 10-360 INR based on CSV
  const minPrice = 10;
  const maxPrice = 360;
  const normalizedPrice = (item.estimated_price_inr - minPrice) / (maxPrice - minPrice);
  return (1 - normalizedPrice) * 100;
}

function getPriorityWeights(priority: string) {
  switch (priority) {
    case 'minimize_damage':
      return { protection: 0.5, fit: 0.25, cost: 0.1, transport: 0.15 };
    case 'minimize_cost':
      return { protection: 0.2, fit: 0.15, cost: 0.5, transport: 0.15 };
    case 'balanced':
    default:
      return { protection: 0.4, fit: 0.25, cost: 0.2, transport: 0.15 };
  }
}

function calculateConfidence(input: UserInput): 'High' | 'Medium' | 'Low' {
  let confidence = 100;

  if (!input.length_mm || !input.width_mm || !input.height_mm) {
    confidence -= 15;
  }

  if (input.fragility === 'Unknown') {
    confidence -= 15;
  }

  if (!input.weight_kg) {
    confidence -= 10;
  }

  if (confidence > 85) return 'High';
  if (confidence >= 60) return 'Medium';
  return 'Low';
}

function generateReasons(
  item: PackagingOption,
  protectionScore: number,
  fitScore: number,
  costScore: number
): string[] {
  const reasons: string[] = [];

  if (protectionScore > 80) {
    reasons.push(`High strength with ECT ${item.ECT_lb_per_in} and ${item.board_type} construction`);
  }

  if (fitScore > 80) {
    reasons.push('Excellent dimensional fit for your product');
  }

  if (costScore > 70) {
    reasons.push('Cost-effective solution at ₹' + item.estimated_price_inr.toFixed(2) + ' per unit');
  }

  if (item.internal_protection !== 'None') {
    reasons.push(`Includes ${item.internal_protection.toLowerCase()} for added protection`);
  }

  return reasons.length > 0 ? reasons : ['Suitable match for your requirements'];
}
