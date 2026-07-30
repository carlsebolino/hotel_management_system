/**
 * Combines class name values while omitting falsey entries.
 *
 * This keeps the layout primitives independent of an additional class-name
 * dependency and supports conditional classes when they are needed.
 */
export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}
