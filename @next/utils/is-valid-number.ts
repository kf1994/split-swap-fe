export function isValidNumber(value: number): boolean {
  if (typeof value !== "number" || value === null || value === undefined || isNaN(value) || !isFinite(value)) return false
  else return true
}
