export function stringToNumber(str: string): number {
  const num = parseFloat(str.replace(/,/g, ""))
  return num
}
