/**
 * Coordinates the PvP halftime substitution window: registers which users
 * are expected to respond for a given match, records their `match:subs`
 * submissions as they arrive, and lets the match-running code wait for
 * either everyone to respond or a timeout — whichever comes first.
 *
 * In-process only (a Map), which is why it's only used for same-instance
 * matches (runMatch) — cross-instance PvP matches (runMatchAndStore) don't
 * currently get a real halftime window for the remote player, since that
 * would need cross-instance messaging; see the comment where it's used.
 */

export interface HalftimeSquadChange {
  players: { ownedPlayerId: string; position: "GK" | "DEF" | "MID" | "FWD" }[];
}

interface Wait {
  submissions: Map<string, HalftimeSquadChange | null>; // null = submitted, no change
  onSubmission: (() => void)[];
}

const waits = new Map<string, Wait>();

export function openHalftimeWait(matchId: string): void {
  waits.set(matchId, { submissions: new Map(), onSubmission: [] });
}

/** Records a participant's halftime submission (or lack of a change). */
export function submitHalftimeChange(
  matchId: string,
  userId: string,
  change: HalftimeSquadChange | undefined,
): void {
  const wait = waits.get(matchId);
  if (!wait) return;
  wait.submissions.set(userId, change ?? null);
  wait.onSubmission.forEach((fn) => fn());
}

/**
 * Waits until every participant has submitted (or explicitly passed) their
 * halftime change, or until timeoutMs elapses — whichever is first.
 * Whoever hasn't responded by the timeout is treated as "no change".
 */
export async function waitForHalftimeChanges(
  matchId: string,
  participantUserIds: string[],
  timeoutMs: number,
): Promise<Map<string, HalftimeSquadChange | null>> {
  const wait = waits.get(matchId);
  if (!wait) return new Map();

  const allSubmitted = () => participantUserIds.every((id) => wait.submissions.has(id));

  if (!allSubmitted()) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, timeoutMs);
      wait.onSubmission.push(() => {
        if (allSubmitted()) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
  }

  waits.delete(matchId);
  return wait.submissions;
}
