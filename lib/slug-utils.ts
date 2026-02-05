/**
 * Utility functions for slug generation and validation
 */

/**
 * Sanitize a string to create a valid slug
 * @param text - The text to convert to a slug
 * @param maxLength - Maximum length of the slug (before suffixes)
 * @returns A sanitized slug
 */
export function sanitizeSlug(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Truncate to maxLength
    .substring(0, maxLength);
}

/**
 * Generate a unique slug by appending username and/or number
 * @param baseSlug - The base slug to start with
 * @param username - The username to append if conflict occurs
 * @param attempt - The attempt number (0 = no suffix, 1 = username, 2+ = username-number)
 * @returns A modified slug
 */
export function generateSlugWithSuffix(
  baseSlug: string,
  username: string | null,
  attempt: number
): string {
  // Sanitize username if provided
  const cleanUsername = username ? sanitizeSlug(username, 20) : null;

  if (attempt === 0) {
    return baseSlug;
  }

  // If no username available, use numeric suffix only
  if (!cleanUsername) {
    return `${baseSlug}-${attempt}`;
  }

  // First attempt: add username
  if (attempt === 1) {
    return `${baseSlug}-${cleanUsername}`;
  }

  // Subsequent attempts: add username and number
  return `${baseSlug}-${cleanUsername}-${attempt}`;
}

/**
 * Check if a slug is valid (contains only lowercase letters, numbers, and hyphens)
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100; // Max total length including suffixes
}

/**
 * Generate slug from filename (for zip uploads)
 * @param filename - The original filename
 * @returns A sanitized slug
 */
export function generateSlugFromFilename(filename: string): string {
  // Remove file extension
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');
  return sanitizeSlug(nameWithoutExtension);
}

/**
 * Truncate a slug while preserving word boundaries if possible
 * @param slug - The slug to truncate
 * @param maxLength - Maximum length
 * @returns Truncated slug
 */
export function truncateSlug(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) {
    return slug;
  }

  // Try to truncate at a hyphen boundary
  const truncated = slug.substring(0, maxLength);
  const lastHyphenIndex = truncated.lastIndexOf('-');

  if (lastHyphenIndex > maxLength * 0.7) {
    // If we have a hyphen reasonably close to the end, truncate there
    return truncated.substring(0, lastHyphenIndex);
  }

  return truncated;
}