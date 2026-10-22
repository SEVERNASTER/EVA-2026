/**
 * Eligibility check types for HU-05.
 *
 * A participant is "apto" (eligible) when their grade meets the course's
 * minimum score AND their attendance percentage reaches the minimum threshold.
 */

/** Criteria thresholds configured on the course. */
export type EligibilityCriteria = {
  notaMinima: number;
  asistenciaMinima: number;
};

/** Computed progress values for a single enrollment. */
export type EligibilityProgress = {
  score: number | null;
  attendancePercent: number;
  sessionsPresent: number;
  sessionsTotal: number;
};

/** Individual criterion that was not met. */
export type FailedCriterion =
  | { criterion: "nota"; actual: number | null; required: number }
  | { criterion: "asistencia"; actual: number; required: number };

/** Result when the participant IS eligible. */
export type EligibleResult = {
  eligible: true;
  enrollmentId: string;
  studentName: string;
  courseName: string;
  criteria: EligibilityCriteria;
  progress: EligibilityProgress;
};

/** Result when the participant is NOT eligible. */
export type IneligibleResult = {
  eligible: false;
  enrollmentId: string;
  studentName: string;
  courseName: string;
  criteria: EligibilityCriteria;
  progress: EligibilityProgress;
  reasons: FailedCriterion[];
};

/** Union returned by the eligibility check action. */
export type EligibilityResult = EligibleResult | IneligibleResult;

/** Action return: either a successful result or an error message. */
export type EligibilityResponse =
  | { data: EligibilityResult }
  | { error: string };

// ---------------------------------------------------------------------------
// Pure helpers — no DB access, unit-testable
// ---------------------------------------------------------------------------

/**
 * Compute the attendance percentage. Returns 0 when there are no sessions
 * (avoids division by zero).
 */
export function computeAttendancePercent(
  present: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

/**
 * Determine eligibility from raw progress and course criteria.
 * Pure function: receives data, returns result — no side effects.
 */
export function evaluateEligibility(
  enrollmentId: string,
  studentName: string,
  courseName: string,
  criteria: EligibilityCriteria,
  progress: EligibilityProgress,
): EligibilityResult {
  const reasons: FailedCriterion[] = [];

  if (progress.score === null || progress.score < criteria.notaMinima) {
    reasons.push({
      criterion: "nota",
      actual: progress.score,
      required: criteria.notaMinima,
    });
  }

  if (progress.attendancePercent < criteria.asistenciaMinima) {
    reasons.push({
      criterion: "asistencia",
      actual: progress.attendancePercent,
      required: criteria.asistenciaMinima,
    });
  }

  const base = { enrollmentId, studentName, courseName, criteria, progress };

  if (reasons.length === 0) {
    return { ...base, eligible: true };
  }
  return { ...base, eligible: false, reasons };
}

/** Human-readable label for a failed criterion. */
export function failedCriterionLabel(reason: FailedCriterion): string {
  if (reason.criterion === "nota") {
    const actual =
      reason.actual === null ? "sin nota" : String(Number(reason.actual));
    return `Nota insuficiente: ${actual} (mínimo ${Number(reason.required)})`;
  }
  return `Asistencia insuficiente: ${reason.actual} % (mínimo ${Number(reason.required)} %)`;
}

/** Short label for the eligibility result. */
export function eligibilityLabel(result: EligibilityResult): string {
  return result.eligible ? "Apto" : "No apto";
}

