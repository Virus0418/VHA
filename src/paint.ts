export interface PaintDecision {
  key: string;
  changed: boolean;
}

/**
 * Decide whether a card should replace its DOM.
 * Home Assistant assigns `hass` on almost every state change in the system.
 * Rebuilding with `innerHTML` when the snapshot is unchanged drops the element
 * under an in-progress click, so the gesture never completes.
 */
export function paintChanged(previous: string, snapshot: unknown): PaintDecision {
  const key = JSON.stringify(snapshot) ?? "";
  return { key, changed: key !== previous };
}
