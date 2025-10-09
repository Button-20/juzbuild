// Utility functions for domain checking with Namecheap integration

export interface DomainCheckResult {
  exists: boolean;
  available: boolean;
  domain: string;
  message: string;
  source: "local" | "external";
  external?: {
    result?: {
      domain: string;
      available: boolean;
      isPremium: boolean;
      premiumPrice?: string;
      description?: string;
    };
    error?: string;
    hasConfiguration?: boolean;
  };
}

/**
 * Check domain availability using local database only
 */
export async function checkDomainLocal(
  domain: string
): Promise<DomainCheckResult> {
  const response = await fetch(
    `/api/check-domain?domain=${encodeURIComponent(domain)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to check domain");
  }

  return response.json();
}

/**
 * Check domain availability using both local database and external Namecheap API
 */
export async function checkDomainEnhanced(
  domain: string,
  includeExternal: boolean = true
): Promise<DomainCheckResult> {
  const params = new URLSearchParams({
    domain,
    external: includeExternal.toString(),
  });

  const response = await fetch(`/api/check-domain?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to check domain");
  }

  return response.json();
}

/**
 * Format domain name for display
 */
export function formatDomainName(
  domain: string,
  includeSubdomain: boolean = true
): string {
  const cleanDomain = domain.toLowerCase().trim();

  if (includeSubdomain && !cleanDomain.includes(".")) {
    return `${cleanDomain}.onjuzbuild.com`;
  }

  return cleanDomain;
}

/**
 * Validate domain name format
 */
export function validateDomainName(domain: string): {
  valid: boolean;
  message?: string;
} {
  const cleanDomain = domain.toLowerCase().trim();

  if (!cleanDomain) {
    return { valid: false, message: "Domain name is required" };
  }

  if (cleanDomain.length < 3) {
    return {
      valid: false,
      message: "Domain name must be at least 3 characters",
    };
  }

  if (cleanDomain.length > 63) {
    return {
      valid: false,
      message: "Domain name must be less than 63 characters",
    };
  }

  // For subdomain checking (without TLD)
  if (!cleanDomain.includes(".")) {
    if (!/^[a-zA-Z0-9-]+$/.test(cleanDomain)) {
      return {
        valid: false,
        message: "Domain name can only contain letters, numbers, and hyphens",
      };
    }

    if (cleanDomain.startsWith("-") || cleanDomain.endsWith("-")) {
      return {
        valid: false,
        message: "Domain name cannot start or end with a hyphen",
      };
    }

    return { valid: true };
  }

  // For full domain checking (with TLD)
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  if (!domainRegex.test(cleanDomain)) {
    return { valid: false, message: "Invalid domain name format" };
  }

  return { valid: true };
}

/**
 * Debounced domain check function for real-time validation
 */
export function createDebouncedDomainCheck(
  checkFunction: (domain: string) => Promise<DomainCheckResult>,
  delay: number = 500
) {
  let timeoutId: NodeJS.Timeout;

  return (domain: string): Promise<DomainCheckResult> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await checkFunction(domain);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}
