export function stripFormat(s: string): string {
  return s.replace(/\u001b\[.*?m/g, "")
}
