// Namecheap API library for domain operations
// Documentation: https://www.namecheap.com/support/api/

interface NamecheapConfig {
  apiUser: string;
  apiKey: string;
  userName: string;
  clientIp: string;
  sandbox?: boolean;
}

interface DomainCheckResult {
  domain: string;
  available: boolean;
  errorNo?: string;
  description?: string;
  isPremiumName?: boolean;
  premiumRegistrationPrice?: string;
  premiumRenewalPrice?: string;
  premiumRestorePrice?: string;
  premiumTransferPrice?: string;
  icannFee?: string;
  eapFee?: string;
}

interface NamecheapResponse {
  ApiResponse: {
    Status: string;
    Errors?: {
      Error: Array<{
        Number: string;
        Description: string;
      }>;
    };
    CommandResponse?: {
      DomainCheckResult?: DomainCheckResult[];
    };
  };
}

class NamecheapAPI {
  private config: NamecheapConfig;
  private baseUrl: string;

  constructor(config: NamecheapConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? "https://api.sandbox.namecheap.com/xml.response"
      : "https://api.namecheap.com/xml.response";
  }

  private buildUrl(
    command: string,
    additionalParams: Record<string, string> = {}
  ): string {
    const params = new URLSearchParams({
      ApiUser: this.config.apiUser,
      ApiKey: this.config.apiKey,
      UserName: this.config.userName,
      Command: command,
      ClientIp: this.config.clientIp,
      ...additionalParams,
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  private async makeRequest(url: string): Promise<NamecheapResponse> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Juzbuild/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();

      // Parse XML response using a simple string-based approach for Node.js compatibility
      return this.parseXmlResponseString(xmlText);
    } catch (error) {
      console.error("Namecheap API request failed:", error);
      throw new Error(
        `Namecheap API request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private parseXmlResponseString(xmlText: string): NamecheapResponse {
    try {
      // Extract Status
      const statusMatch = xmlText.match(/<ApiResponse\s+Status="([^"]+)"/);
      const status = statusMatch ? statusMatch[1] : "";

      // Parse errors if any
      const errorRegex = /<Error\s+Number="([^"]+)"[^>]*>([^<]*)<\/Error>/g;
      const errors: Array<{ Number: string; Description: string }> = [];
      let errorMatch;
      while ((errorMatch = errorRegex.exec(xmlText)) !== null) {
        errors.push({
          Number: errorMatch[1],
          Description: errorMatch[2],
        });
      }

      // Parse domain check results
      const domainResultRegex =
        /<DomainCheckResult\s+([^>]+)(?:\s*\/>|\s*><\/DomainCheckResult>)/g;
      const domainCheckResults: DomainCheckResult[] = [];
      let domainMatch;

      while ((domainMatch = domainResultRegex.exec(xmlText)) !== null) {
        const attributes = domainMatch[1];

        // Extract attributes using regex
        const getAttr = (name: string): string | undefined => {
          const match = attributes.match(new RegExp(`${name}="([^"]*)"`, "i"));
          return match ? match[1] : undefined;
        };

        const domain = getAttr("Domain") || "";
        const available = getAttr("Available")?.toLowerCase() === "true";
        const errorNo = getAttr("ErrorNo");
        const description = getAttr("Description");
        const isPremiumName =
          getAttr("IsPremiumName")?.toLowerCase() === "true";

        domainCheckResults.push({
          domain,
          available,
          errorNo,
          description,
          isPremiumName,
          premiumRegistrationPrice: getAttr("PremiumRegistrationPrice"),
          premiumRenewalPrice: getAttr("PremiumRenewalPrice"),
          premiumRestorePrice: getAttr("PremiumRestorePrice"),
          premiumTransferPrice: getAttr("PremiumTransferPrice"),
          icannFee: getAttr("IcannFee"),
          eapFee: getAttr("EapFee"),
        });
      }

      return {
        ApiResponse: {
          Status: status,
          Errors: errors.length > 0 ? { Error: errors } : undefined,
          CommandResponse:
            domainCheckResults.length > 0
              ? { DomainCheckResult: domainCheckResults }
              : undefined,
        },
      };
    } catch (error) {
      console.error("XML parsing error:", error);
      throw new Error("Failed to parse XML response");
    }
  }

  /**
   * Check domain availability
   * @param domains Array of domain names to check (e.g., ['example.com', 'test.org'])
   * @returns Promise with domain check results
   */
  async checkDomains(domains: string[]): Promise<DomainCheckResult[]> {
    if (!domains || domains.length === 0) {
      throw new Error("At least one domain must be provided");
    }

    if (domains.length > 50) {
      throw new Error("Maximum 50 domains can be checked at once");
    }

    const domainList = domains.join(",");
    const url = this.buildUrl("namecheap.domains.check", {
      DomainList: domainList,
    });

    const response = await this.makeRequest(url);

    if (response.ApiResponse.Status !== "OK") {
      const errors = response.ApiResponse.Errors?.Error || [];
      const errorMessage = errors
        .map((e) => `${e.Number}: ${e.Description}`)
        .join(", ");
      throw new Error(`Namecheap API error: ${errorMessage}`);
    }

    return response.ApiResponse.CommandResponse?.DomainCheckResult || [];
  }

  /**
   * Check single domain availability
   * @param domain Domain name to check (e.g., 'example.com')
   * @returns Promise with domain check result
   */
  async checkDomain(domain: string): Promise<DomainCheckResult> {
    const results = await this.checkDomains([domain]);

    if (results.length === 0) {
      throw new Error("No results returned from Namecheap API");
    }

    return results[0];
  }
}

// Export the class and types
export { NamecheapAPI, type DomainCheckResult, type NamecheapConfig };

// Create and export a singleton instance if environment variables are available
let namecheapInstance: NamecheapAPI | null = null;

export function getNamecheapInstance(): NamecheapAPI {
  if (!namecheapInstance) {
    const config: NamecheapConfig = {
      apiUser: process.env.NAMECHEAP_API_USER || "",
      apiKey: process.env.NAMECHEAP_API_KEY || "",
      userName: process.env.NAMECHEAP_USERNAME || "",
      clientIp: process.env.NAMECHEAP_CLIENT_IP || "127.0.0.1",
      sandbox: process.env.NAMECHEAP_SANDBOX === "true",
    };

    // Validate required config
    if (!config.apiUser || !config.apiKey || !config.userName) {
      throw new Error(
        "Missing required Namecheap API configuration. Please set NAMECHEAP_API_USER, NAMECHEAP_API_KEY, and NAMECHEAP_USERNAME environment variables."
      );
    }

    namecheapInstance = new NamecheapAPI(config);
  }

  return namecheapInstance;
}
