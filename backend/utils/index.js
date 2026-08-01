export function assertNever(value) {
  throw new Error(`Unexpected value: ${String(value)}`);
}
