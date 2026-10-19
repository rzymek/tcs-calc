export function assertNever(v: unknown): never {
  throw new Error(`Unexpected value: ${JSON.stringify(v)}`);
}
