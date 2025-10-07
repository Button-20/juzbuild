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

  /**
   * Create DNS host record (subdomain)
   * @param domain - The domain to add DNS record to (e.g., "onjuzbuild.com")
   * @param subdomain - The subdomain name (e.g., "testsite")
   * @param target - The target URL or IP (e.g., "your-app.vercel.app")
   * @param recordType - DNS record type (default: "CNAME")
   * @returns Promise with creation result
   */
  /**
   * Get all JuzBuild subdomains from database to preserve them
   */
  private async getAllJuzBuildSubdomains(): Promise<
    Array<{
      hostName: string;
      recordType: string;
      address: string;
      ttl: string;
    }>
  > {
    try {
      // Import MongoDB client
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"
      );

      await client.connect();
      const db = client.db("Juzbuild");
      const sitesCollection = db.collection("sites");

      // Get all sites that have domains
      const sites = await sitesCollection
        .find({
          domain: { $exists: true, $ne: null },
        })
        .toArray();

      await client.close();

      // Convert sites to DNS records
      const subdomainRecords = sites.map((site) => ({
        hostName: site.websiteName,
        recordType: "CNAME",
        address: `${site.websiteName}.vercel.app`,
        ttl: "300",
      }));

      // Add default records with URL redirect to juzbuild.com
      const defaultRecords = [
        {
          hostName: "@",
          recordType: "URL",
          address: "https://juzbuild.com",
          ttl: "1800",
        },
        {
          hostName: "www",
          recordType: "URL",
          address: "https://juzbuild.com",
          ttl: "1800",
        },
      ];

      return [...defaultRecords, ...subdomainRecords];
    } catch (error) {
      // Could not retrieve subdomain records from database, using defaults with URL redirect
      return [
        {
          hostName: "@",
          recordType: "URL",
          address: "https://juzbuild.com",
          ttl: "1800",
        },
        {
          hostName: "www",
          recordType: "URL",
          address: "https://juzbuild.com",
          ttl: "1800",
        },
      ];
    }
  }

  async createDNSRecord(
    domain: string,
    subdomain: string,
    target: string,
    recordType: string = "CNAME"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const sld = domain.split(".")[0];
      const tld = domain.split(".")[1];

      // Get all JuzBuild subdomains to preserve them
      const existingRecords = await this.getAllJuzBuildSubdomains();

      // Check if this subdomain already exists
      const existingSubdomain = existingRecords.find(
        (record) => record.hostName === subdomain
      );

      if (existingSubdomain) {
        // Subdomain already exists, updating...
        // Remove the existing record
        const filteredRecords = existingRecords.filter(
          (record) => record.hostName !== subdomain
        );
        existingRecords.splice(0, existingRecords.length, ...filteredRecords);
      }

      // Add the new subdomain record
      existingRecords.push({
        hostName: subdomain,
        recordType: recordType,
        address: target,
        ttl: "300",
      });

      // Build the setHosts parameters with all records
      const setHostsParams: Record<string, string> = {
        SLD: sld,
        TLD: tld,
      };

      // Add all records to the parameters
      existingRecords.forEach((record, index) => {
        const recordNum = index + 1;
        setHostsParams[`HostName${recordNum}`] = record.hostName;
        setHostsParams[`RecordType${recordNum}`] = record.recordType;
        setHostsParams[`Address${recordNum}`] = record.address;
        setHostsParams[`TTL${recordNum}`] = record.ttl;
      });

      const setHostsUrl = this.buildUrl(
        "namecheap.domains.dns.setHosts",
        setHostsParams
      );

      const result = await this.makeRequest(setHostsUrl);

      if (result.ApiResponse.Status === "OK") {
        return {
          success: true,
          message: `Successfully created ${recordType} record for ${subdomain}.${domain}`,
        };
      } else {
        const errorMsg =
          result.ApiResponse.Errors?.Error?.[0]?.Description || "Unknown error";
        return {
          success: false,
          message: `Failed to create DNS record: ${errorMsg}`,
        };
      }
    } catch (error) {
      console.error("DNS record creation failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "DNS creation failed",
      };
    }
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
