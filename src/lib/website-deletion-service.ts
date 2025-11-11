// Website Deletion Service
// Handles complete removal of websites from Vercel, GitHub, MongoDB, custom databases, Google Analytics, and Namecheap
import { MongoClient, ObjectId } from "mongodb";

interface DeletionOptions {
  siteId: string;
  userId: string;
  projectName?: string;
  githubRepo?: string;
  githubOwner?: string;
  dbName?: string;
  ga4PropertyId?: string;
  domain?: string;
}

interface DeletionResult {
  success: boolean;
  deletedResources: {
    vercel?: boolean;
    github?: boolean;
    mongodb?: boolean;
    customDatabase?: boolean;
    googleAnalytics?: boolean;
    namecheap?: boolean;
  };
  errors?: string[];
}

class WebsiteDeletionService {
  /**
   * Delete a complete website and all its configurations
   */
  async deleteWebsite(options: DeletionOptions): Promise<DeletionResult> {
    const deletedResources: DeletionResult["deletedResources"] = {};
    const errors: string[] = [];

    try {
      // Step 1: Delete Vercel project
      if (options.projectName) {
        try {
          console.log(`🗑️ Deleting Vercel project: ${options.projectName}`);
          await this.deleteVercelProject(options.projectName);
          deletedResources.vercel = true;
          console.log(`✅ Vercel project deleted`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("Failed to delete Vercel project:", errorMsg);
          errors.push(`Vercel deletion failed: ${errorMsg}`);
          // Continue with other deletions even if Vercel fails
        }
      }

      // Step 2: Delete GitHub repository
      if (options.githubRepo && options.githubOwner) {
        try {
          console.log(
            `🗑️ Deleting GitHub repository: ${options.githubOwner}/${options.githubRepo}`
          );
          await this.deleteGitHubRepository(
            options.githubOwner,
            options.githubRepo
          );
          deletedResources.github = true;
          console.log(`✅ GitHub repository deleted`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("Failed to delete GitHub repository:", errorMsg);
          errors.push(`GitHub deletion failed: ${errorMsg}`);
          // Continue with other deletions even if GitHub fails
        }
      }

      // Step 4: Delete Google Analytics property
      if (options.ga4PropertyId) {
        try {
          console.log(`🗑️ Deleting Google Analytics property: ${options.ga4PropertyId}`);
          await this.deleteGoogleAnalyticsProperty(options.ga4PropertyId);
          deletedResources.googleAnalytics = true;
          console.log(`✅ Google Analytics property deleted`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("Failed to delete Google Analytics property:", errorMsg);
          errors.push(`Google Analytics deletion failed: ${errorMsg}`);
          // Continue with other deletions even if GA4 fails
        }
      }

      // Step 5: Delete Namecheap subdomain
      if (options.domain) {
        try {
          console.log(`🗑️ Deleting Namecheap subdomain: ${options.domain}`);
          await this.deleteNamecheapDomain(options.domain);
          deletedResources.namecheap = true;
          console.log(`✅ Namecheap subdomain deleted`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("Failed to delete Namecheap domain:", errorMsg);
          errors.push(`Namecheap deletion failed: ${errorMsg}`);
          // Continue with other deletions even if Namecheap fails
        }
      }

      // Step 6: Delete custom MongoDB database
      if (options.dbName) {
        try {
          console.log(`🗑️ Deleting custom database: ${options.dbName}`);
          await this.deleteCustomDatabase(options.dbName);
          deletedResources.customDatabase = true;
          console.log(`✅ Custom database deleted`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error("Failed to delete custom database:", errorMsg);
          errors.push(`Custom database deletion failed: ${errorMsg}`);
          // Continue with other deletions even if custom database fails
        }
      }

      // Step 7: Delete site record from Juzbuild MongoDB
      try {
        console.log(`🗑️ Deleting site record from MongoDB`);
        await this.deleteSiteRecord(options.siteId, options.userId);
        deletedResources.mongodb = true;
        console.log(`✅ Site record deleted from MongoDB`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Failed to delete site record:", errorMsg);
        errors.push(`Site record deletion failed: ${errorMsg}`);
        // Continue even if this fails
      }

      // Determine overall success
      const success =
        Object.values(deletedResources).filter((v) => v === true).length > 0;

      if (success) {
        console.log("✅ Website deletion completed");
      }

      return {
        success,
        deletedResources,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Website deletion failed:", error);
      return {
        success: false,
        deletedResources,
        errors: [
          ...(errors || []),
          error instanceof Error ? error.message : "Unknown error",
        ],
      };
    }
  }

  /**
   * Delete Vercel project via API
   */
  private async deleteVercelProject(projectId: string): Promise<void> {
    const token = process.env.VERCEL_TOKEN;

    if (!token) {
      throw new Error("Vercel token not configured");
    }

    try {
      const response = await fetch(
        `https://api.vercel.com/v13/projects/${encodeURIComponent(projectId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        throw new Error(
          `Vercel API error ${response.status}: ${responseText || response.statusText}`
        );
      }

      console.log(`✓ Vercel project ${projectId} deleted successfully`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete GitHub repository
   */
  private async deleteGitHubRepository(
    owner: string,
    repo: string
  ): Promise<void> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GitHub token not configured in GITHUB_TOKEN environment variable");
    }

    if (!owner || !repo) {
      throw new Error(`Invalid GitHub repository: owner=${owner}, repo=${repo}`);
    }

    try {
      // Validate token format
      const trimmedToken = token.trim();
      
      if (trimmedToken.length < 20) {
        throw new Error(`GitHub token appears invalid (too short): ${trimmedToken.length} characters. Make sure GITHUB_TOKEN is set correctly in your environment.`);
      }

      // GitHub API v3 expects: token <token> for personal access tokens
      // Fine-grained PATs (github_pat_*) require specific repository access
      const authHeader = `token ${trimmedToken}`;

      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader,
            "X-GitHub-Api-Version": "2022-11-28",
            "Accept": "application/vnd.github+json",
            "User-Agent": "Juzbuild/1.0",
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        
        // Better error message for 401
        if (response.status === 401) {
          const errorDetail = responseText ? JSON.parse(responseText) : {};
          throw new Error(
            `GitHub authentication failed (401 Unauthorized). ` +
            `Token may be invalid, expired, or lack required permissions (delete_repo, admin:repo_hook). ` +
            `Error: ${errorDetail.message || 'Bad credentials'}`
          );
        }
        
        throw new Error(
          `GitHub API error ${response.status}: ${responseText || response.statusText}`
        );
      }

      console.log(`✓ GitHub repository ${owner}/${repo} deleted successfully`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete custom website database from MongoDB
   */
  private async deleteCustomDatabase(dbName: string): Promise<void> {
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Juzbuild"
    );

    try {
      await client.connect();
      const db = client.db(dbName);

      // Drop the database
      await db.dropDatabase();

      console.log(`✓ Database ${dbName} deleted`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("database not found")) {
        console.log(`Database ${dbName} not found (may have been deleted already)`);
        return;
      }
      throw error;
    } finally {
      await client.close();
    }
  }

  /**
   * Delete site record from Juzbuild MongoDB
   */
  private async deleteSiteRecord(
    siteId: string,
    userId: string
  ): Promise<void> {
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Juzbuild"
    );

    try {
      await client.connect();
      const db = client.db("Juzbuild");
      const sitesCollection = db.collection("sites");

      // Delete the site record, ensuring user ownership
      const result = await sitesCollection.deleteOne({
        _id: new ObjectId(siteId),
        userId: userId,
      });

      if (result.deletedCount === 0) {
        throw new Error(
          "Site not found or user not authorized to delete this site"
        );
      }

      console.log(`✓ Site record ${siteId} deleted`);
    } finally {
      await client.close();
    }
  }

  /**
   * Delete Google Analytics property
   */
  private async deleteGoogleAnalyticsProperty(propertyId: string): Promise<void> {
    const serviceAccountKeyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKeyEnv) {
      throw new Error("Google service account key not configured");
    }

    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    try {
      console.log(`Attempting to delete GA4 property: ${propertyId}`);

      // Decode base64 service account key if needed
      let serviceAccountKeyStr = serviceAccountKeyEnv;
      
      if (!serviceAccountKeyStr.startsWith("{")) {
        try {
          serviceAccountKeyStr = Buffer.from(serviceAccountKeyStr, "base64").toString("utf-8");
        } catch (e) {
          // Service account key is not base64 encoded, using as-is
        }
      }

      // Parse the service account key
      let serviceAccount: any;
      try {
        serviceAccount = JSON.parse(serviceAccountKeyStr);
      } catch (e) {
        throw new Error(`Failed to parse service account key: ${e instanceof Error ? e.message : String(e)}`);
      }

      // Get OAuth access token using JWT bearer flow
      const accessToken = await this.getGoogleOAuthToken(serviceAccount);

      if (!accessToken) {
        throw new Error("Failed to get Google OAuth access token");
      }

      // Call the Google Analytics Admin API v1beta to delete the property
      // API: DELETE https://analyticsadmin.googleapis.com/v1beta/properties/{propertyId}
      const response = await fetch(
        `https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 404) {
          return;
        }
        
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `GA4 API authentication failed (${response.status}). ` +
            `Service account may not have 'analytics.edit' permission or token may be invalid.`
          );
        }

        throw new Error(
          `GA4 Admin API error ${response.status}: ${responseText || response.statusText}`
        );
      }

      console.log(`✓ Google Analytics property ${propertyId} deleted successfully`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to delete GA4 property:`, errorMsg);
      throw error;
    }
  }

  /**
   * Get Google OAuth access token using JWT bearer flow
   * Used for authenticating with Google Analytics Admin API
   */
  private async getGoogleOAuthToken(serviceAccount: any): Promise<string> {
    try {
      const crypto = await import("crypto");

      // Create JWT claims
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 3600; // 1 hour expiration

      const header = {
        alg: "RS256",
        typ: "JWT",
        kid: serviceAccount.private_key_id,
      };

      const payload = {
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/analytics.edit",
        aud: "https://oauth2.googleapis.com/token",
        exp: exp,
        iat: now,
      };

      // Encode JWT parts
      const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

      // Sign JWT with private key
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(`${headerB64}.${payloadB64}`);
      const signatureB64 = sign
        .sign(serviceAccount.private_key, "base64")
        .toString()
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

      const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;

      // Exchange JWT for access token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }).toString(),
      });

      const tokenData = await tokenResponse.json() as any;

      if (!tokenResponse.ok) {
        throw new Error(
          `Failed to get Google OAuth token: ${tokenData.error || "Unknown error"}`
        );
      }

      if (!tokenData.access_token) {
        throw new Error("No access token in response");
      }

      return tokenData.access_token;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to get Google OAuth token:", errorMsg);
      throw error;
    }
  }

  /**
   * Delete Namecheap subdomain
   */
  private async deleteNamecheapDomain(domain: string): Promise<void> {
    const apiUser = process.env.NAMECHEAP_API_USER;
    const apiKey = process.env.NAMECHEAP_API_KEY;
    const userName = process.env.NAMECHEAP_USERNAME;
    const clientIp = process.env.NAMECHEAP_CLIENT_IP || "127.0.0.1";

    if (!apiUser || !apiKey || !userName) {
      throw new Error("Namecheap API credentials not configured");
    }

    try {
      // Parse domain to get subdomain and main domain
      // Expected format: subdomain.onjuzbuild.com
      const parts = domain.split(".");
      if (parts.length < 3) {
        throw new Error(`Invalid subdomain format: ${domain}. Expected: subdomain.onjuzbuild.com`);
      }

      // For onjuzbuild.com subdomains: extract parts
      const subdomain = parts[0];
      const sld = parts[1];
      const tld = parts.slice(2).join(".");

      console.log(`[Namecheap] Domain parts - subdomain: ${subdomain}, sld: ${sld}, tld: ${tld}`);

      // Step 1: Get existing DNS records for this domain
      const getParams = new URLSearchParams({
        ApiUser: apiUser,
        ApiKey: apiKey,
        UserName: userName,
        Command: "namecheap.domains.dns.getHosts",
        SLD: sld,
        TLD: tld,
        ClientIp: clientIp,
      });

      const getResponse = await fetch(
        `https://api.namecheap.com/xml.response?${getParams.toString()}`,
        {
          method: "GET",
        }
      );

      if (!getResponse.ok) {
        throw new Error(
          `Namecheap API error ${getResponse.status}: ${getResponse.statusText}`
        );
      }

      const getResponseText = await getResponse.text();

      // Step 1.5: Parse all records first to see what we're working with
      const allRecords = this.getAllNamecheapRecords(getResponseText);

      // Parse XML response to find subdomain records
      // We'll look for records that match our subdomain
      const subdomainRecordIds = this.parseNamecheapSubdomainRecords(getResponseText, subdomain);

      if (subdomainRecordIds.length === 0) {
        // Still return without throwing - the records may already be deleted
        return;
      }

      // Step 2: Delete the DNS records for this subdomain
      // Namecheap API requires us to send all DNS records (with subdomain ones removed)
      // Get remaining records by filtering out the ones we want to delete
      const remainingRecords = allRecords.filter((record: any) => 
        !subdomainRecordIds.includes(record.HostId)
      );

      // Build the delete request with remaining records
      const deleteParams = new URLSearchParams({
        ApiUser: apiUser,
        ApiKey: apiKey,
        UserName: userName,
        Command: "namecheap.domains.dns.setHosts",
        SLD: sld,
        TLD: tld,
        ClientIp: clientIp,
      });

      // Add remaining DNS records to the request
      remainingRecords.forEach((record: any, index: number) => {
        const hostNum = index + 1;
        deleteParams.append(`HostName${hostNum}`, record.Name);
        deleteParams.append(`RecordType${hostNum}`, record.Type);
        deleteParams.append(`Address${hostNum}`, record.Address);
        if (record.MXPriority) {
          deleteParams.append(`MXPriority${hostNum}`, record.MXPriority);
        }
        if (record.TTL) {
          deleteParams.append(`TTL${hostNum}`, record.TTL);
        }
      });

      console.log(`[Namecheap] Sending setHosts request to delete subdomain records...`);

      const deleteResponse = await fetch(
        `https://api.namecheap.com/xml.response?${deleteParams.toString()}`,
        {
          method: "POST",
        }
      );

      const deleteResponseText = await deleteResponse.text();
      console.log(`[Namecheap] Delete response status: ${deleteResponse.status}`);
      console.log(`[Namecheap] Delete response preview: ${deleteResponseText.substring(0, 500)}`);

      if (!deleteResponse.ok) {
        throw new Error(
          `Namecheap setHosts failed ${deleteResponse.status}: ${deleteResponseText}`
        );
      }

      // Check if the API response indicates success
      if (deleteResponseText.includes('Status="OK"')) {
        console.log(`✓ Namecheap subdomain ${domain} DNS records deleted successfully`);
      } else if (deleteResponseText.includes('Errors')) {
        throw new Error(`Namecheap API returned errors: ${deleteResponseText}`);
      } else {
        console.log(`✓ Namecheap subdomain ${domain} DNS records processed`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Namecheap] Failed to delete domain ${domain}:`, errorMsg);
      // Don't throw - continue with other deletions (Namecheap cleanup is not critical)
      console.log(`[Namecheap] Continuing with other deletions...`);
    }
  }

  /**
   * Parse Namecheap XML response to find subdomain record IDs
   * Handles attributes in any order
   */
  private parseNamecheapSubdomainRecords(xmlResponse: string, subdomain: string): string[] {
    const recordIds: string[] = [];
    
    try {
      console.log(`[Namecheap] Looking for records matching subdomain: "${subdomain}"`);
      
      // Find all <host ... /> tags
      const hostTagPattern = /<host[^>]+\/>/g;
      let hostMatch;
      
      while ((hostMatch = hostTagPattern.exec(xmlResponse)) !== null) {
        const hostTag = hostMatch[0];
        
        // Extract attributes from this tag (order-independent)
        const hostIdMatch = hostTag.match(/HostId="([^"]*)"/);
        const nameMatch = hostTag.match(/Name="([^"]*)"/);
        
        if (hostIdMatch && nameMatch) {
          const hostId = hostIdMatch[1];
          const name = nameMatch[1];
          
          // Check if this record is for our subdomain
          // Match exact subdomain or subdomain with prefix (e.g., "devtraco" or "devtraco.www")
          if (name === subdomain || name.startsWith(subdomain + ".")) {
            console.log(`[Namecheap] Found matching record: "${name}" (HostId: ${hostId})`);
            recordIds.push(hostId);
          }
        }
      }
      
      console.log(`[Namecheap] Total matching records found: ${recordIds.length}`);
    } catch (e) {
      console.warn(`[Namecheap] Failed to parse subdomain records:`, e);
    }

    return recordIds;
  }

  /**
   * Parse Namecheap XML response to extract all DNS records
   * Handles attributes in any order
   */
  private getAllNamecheapRecords(xmlResponse: string): any[] {
    const records: any[] = [];
    
    try {
      // Find all <host ... /> tags
      const hostTagPattern = /<host[^>]+\/>/g;
      let hostMatch;
      
      while ((hostMatch = hostTagPattern.exec(xmlResponse)) !== null) {
        const hostTag = hostMatch[0];
        
        // Extract attributes (order-independent)
        const hostIdMatch = hostTag.match(/HostId="([^"]*)"/);
        const nameMatch = hostTag.match(/Name="([^"]*)"/);
        const typeMatch = hostTag.match(/Type="([^"]*)"/);
        const addressMatch = hostTag.match(/Address="([^"]*)"/);
        const ttlMatch = hostTag.match(/TTL="([^"]*)"/);
        const mxPriorityMatch = hostTag.match(/MXPriority="([^"]*)"/);
        
        if (hostIdMatch && nameMatch && typeMatch && addressMatch && ttlMatch) {
          records.push({
            HostId: hostIdMatch[1],
            Name: nameMatch[1],
            Type: typeMatch[1],
            Address: addressMatch[1],
            TTL: ttlMatch[1],
            MXPriority: mxPriorityMatch ? mxPriorityMatch[1] : null,
          });
        }
      }
      
      console.log(`[Namecheap] Parsed ${records.length} total DNS records`);
    } catch (e) {
      console.warn(`[Namecheap] Failed to parse all records:`, e);
    }

    return records;
  }
}

// Export singleton instance
const deletionService = new WebsiteDeletionService();

export { deletionService, WebsiteDeletionService, type DeletionOptions, type DeletionResult };
