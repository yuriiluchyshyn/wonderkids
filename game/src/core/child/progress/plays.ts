/**
 * How many levels a child has finished in a game. Stored in the same
 * `progress` map as path steps, under a `#plays` suffix, so it syncs with the
 * save without a schema change. It is what makes free-play games (which have
 * no path step) count towards the world the child is building.
 */
export function playsKey(moduleId: string, subCategoryId: string): string {
  return `${moduleId}:${subCategoryId}#plays`;
}
