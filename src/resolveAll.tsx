export function resolveAll(paths: Record<string, unknown>) {
  return Object.keys(paths).map(it => import.meta.resolve(it));
}