type GoalLocalMeta = {
  title?: string;
  notes?: string;
};

const storageKey = (chainId: number, contract: string) =>
  `goalpledge.meta:${chainId}:${contract.toLowerCase()}`;

export function getLocalMeta(
  chainId: number,
  contract: string,
): Record<string, GoalLocalMeta> {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(storageKey(chainId, contract));
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setLocalMeta(
  chainId: number,
  contract: string,
  meta: Record<string, GoalLocalMeta>,
) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    storageKey(chainId, contract),
    JSON.stringify(meta),
  );
}

export function upsertGoalMeta(
  chainId: number,
  contract: string,
  goalId: bigint,
  fields: GoalLocalMeta,
) {
  const current = getLocalMeta(chainId, contract);
  const key = goalId.toString();
  current[key] = { ...(current[key] || {}), ...fields };
  setLocalMeta(chainId, contract, current);
}


