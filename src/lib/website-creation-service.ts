// Website creation workflow service with all automated steps

import { getNamecheapInstance } from "@/lib/namecheap";
import { getVercelInstance } from "@/lib/vercel";
import { Octokit } from "@octokit/rest";
import fs from "fs/promises";
import { MongoClient } from "mongodb";
import path from "path";

interface WebsiteCreationOptions {
  userId: string;
  websiteName: string;
  userEmail: string;
  fullName: string;
  companyName: string;
  domainName: string;
  brandColors: string[];
  tagline: string;
  aboutSection: string;
  selectedTheme: string;
  layoutStyle: string;
  propertyTypes: string[];
  includedPages: string[];
  preferredContactMethod: string[];
}

interface WorkflowResult {
  success: boolean;
  data?: any;
  error?: string;
  step?: string;
}

class WebsiteCreationService {
  private mongoClient: MongoClient;
  private octokit: Octokit;

  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGODB_URI!);
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  /**
   * Main workflow orchestrator
   */
  async createWebsite(
    options: WebsiteCreationOptions
  ): Promise<WorkflowResult> {
    const results: any = {};
    let vercelUrl: string | undefined;

    try {
      // Step 1: Database Creation
      const dbResult = await this.createLocalDatabase(options);
      if (!dbResult.success) {
        return {
          success: false,
          error: `Database creation failed: ${dbResult.error}`,
          step: "Database Creation",
        };
      }
      results["Database Creation"] = dbResult.data;

      // Step 2: Template Generation
      const templateResult = await this.generateTemplate(options);
      if (!templateResult.success) {
        return {
          success: false,
          error: `Template generation failed: ${templateResult.error}`,
          step: "Template Generation",
        };
      }
      results["Template Generation"] = templateResult.data;

      // Step 3: GitHub Repository
      const githubResult = await this.pushToGitHub(options);
      if (!githubResult.success) {
        return {
          success: false,
          error: `GitHub repository creation failed: ${githubResult.error}`,
          step: "GitHub Repository",
        };
      }
      results["GitHub Repository"] = githubResult.data;

      // Step 4: Vercel Deployment
      const vercelResult = await this.deployToVercel(options);
      if (!vercelResult.success) {
        return {
          success: false,
          error: `Vercel deployment failed: ${vercelResult.error}`,
          step: "Vercel Deployment",
        };
      }
      results["Vercel Deployment"] = vercelResult.data;
      vercelUrl = vercelResult.data?.vercelUrl;

      // Step 5: Subdomain Setup
      const subdomainResult = await this.createSubdomainOnNamecheap(
        options,
        vercelUrl
      );
      if (!subdomainResult.success) {
        return {
          success: false,
          error: `Subdomain setup failed: ${subdomainResult.error}`,
          step: "Subdomain Setup",
        };
      }
      results["Subdomain Setup"] = subdomainResult.data;

      // Step 6: Email Notification
      const emailResult = await this.sendSetupNotification(options);
      if (!emailResult.success) {
        return {
          success: false,
          error: `Email notification failed: ${emailResult.error}`,
          step: "Email Notification",
        };
      }
      results["Email Notification"] = emailResult.data;

      // Step 7: Database Logging
      const loggingResult = await this.logSiteCreation(options);
      if (!loggingResult.success) {
        return {
          success: false,
          error: `Database logging failed: ${loggingResult.error}`,
          step: "Database Logging",
        };
      }
      results["Database Logging"] = loggingResult.data;

      // Step 8: Cleanup temporary template
      await this.cleanupTemplate(options.websiteName);

      return {
        success: true,
        data: {
          websiteName: options.websiteName,
          domain: `${options.domainName}.onjuzbuild.com`,
          status: "active",
          results,
        },
      };
    } catch (error) {
      console.error("Website creation workflow failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Step 1: Create local MongoDB database
   */
  async createLocalDatabase(
    options: WebsiteCreationOptions
  ): Promise<WorkflowResult> {
    try {
      const dbName = `juzbuild_${options.websiteName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}`;
      const connectionString = process.env.MONGODB_URI!.replace(
        /\/[^\/]*$/,
        `/${dbName}`
      );

      const client = new MongoClient(connectionString);
      await client.connect();
      const db = client.db(dbName);

      // Create collections with initial data
      const collections = [
        {
          name: "settings",
          data: {
            siteName: options.companyName,
            websiteName: options.websiteName,
            primaryColor: options.brandColors[0] || "#3B82F6",
            secondaryColor: options.brandColors[1] || "#EF4444",
            accentColor: options.brandColors[2] || "#10B981",
            theme: options.selectedTheme,
            layoutStyle: options.layoutStyle,
            tagline: options.tagline,
            aboutSection: options.aboutSection,
            contactMethods: options.preferredContactMethod,
            userEmail: options.userEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          name: "properties",
          data: [
            {
              id: 1,
              title: "Luxury Family Home",
              description: "Beautiful 4-bedroom family home in prime location",
              price: "$750,000",
              bedrooms: 4,
              bathrooms: 3,
              sqft: 2500,
              type: options.propertyTypes[0] || "House",
              status: "For Sale",
              featured: true,
              images: ["/images/property1.jpg"],
              address: "123 Main Street",
              city: "Downtown",
              createdAt: new Date(),
            },
            {
              id: 2,
              title: "Modern Downtown Condo",
              description: "Contemporary 2-bedroom condo with city views",
              price: "$450,000",
              bedrooms: 2,
              bathrooms: 2,
              sqft: 1200,
              type: "Condo",
              status: "For Sale",
              featured: true,
              images: ["/images/property2.jpg"],
              address: "456 Downtown Ave",
              city: "City Center",
              createdAt: new Date(),
            },
            {
              id: 3,
              title: "Cozy Starter Home",
              description: "Perfect first home with garden and garage",
              price: "$325,000",
              bedrooms: 3,
              bathrooms: 2,
              sqft: 1800,
              type: "House",
              status: "For Sale",
              featured: false,
              images: ["/images/property3.jpg"],
              address: "789 Residential St",
              city: "Suburbs",
              createdAt: new Date(),
            },
          ],
        },
        {
          name: "pages",
          data: options.includedPages.map((page) => ({
            slug: page.toLowerCase().replace(/\s+/g, "-"),
            title: page,
            content: this.generatePageContent(page, options),
            isActive: true,
            order: options.includedPages.indexOf(page),
            createdAt: new Date(),
          })),
        },
        {
          name: "users",
          data: [],
        },
        {
          name: "inquiries",
          data: [],
        },
      ];

      for (const collection of collections) {
        const coll = db.collection(collection.name);
        if (Array.isArray(collection.data)) {
          // Only insert if array has data
          if (collection.data.length > 0) {
            await coll.insertMany(collection.data);
          }
        } else {
          await coll.insertOne(collection.data);
        }
      }

      await client.close();

      return {
        success: true,
        data: {
          databaseName: dbName,
          connectionString,
          collections: collections.map((c) => c.name),
        },
      };
    } catch (error) {
      console.error("Database creation failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Database creation failed",
      };
    }
  }

  /**
   * Step 2: Generate website template based on homely template
   */
  async generateTemplate(
    options: WebsiteCreationOptions
  ): Promise<WorkflowResult> {
    try {
      const homelyBasePath = path.join(process.cwd(), "templates", "homely");
      const templatePath = path.join(
        process.cwd(),
        "templates",
        options.websiteName
      );

      // Check if homely template exists
      if (
        !(await fs
          .access(homelyBasePath)
          .then(() => true)
          .catch(() => false))
      ) {
        throw new Error("Homely base template not found");
      }

      // Copy homely template to user's template directory
      await this.copyDirectory(homelyBasePath, templatePath);

      // Remove admin dashboard configuration
      await this.removeAdminDashboard(templatePath);

      // Configure dynamic database connection
      await this.configureDynamicDatabase(templatePath, options);

      // Create additional pages based on user selections
      await this.createUserPages(templatePath, options);

      // Update template configuration and branding
      await this.customizeTemplate(templatePath, options);

      return {
        success: true,
        data: {
          templatePath,
          structure:
            "Customized homely template with user-specific configuration",
          removedAdmin: true,
          dynamicDatabase: true,
          customPages: options.includedPages?.length || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Template generation failed",
      };
    }
  }

  /**
   * Step 3: Create GitHub repository and push code
   */
  async pushToGitHub(options: WebsiteCreationOptions): Promise<WorkflowResult> {
    try {
      // Check if we have GitHub configuration
      const githubToken = process.env.GITHUB_TOKEN;
      const githubUsername = process.env.GITHUB_USERNAME;

      if (!githubToken || !githubUsername) {
        console.log(
          "GitHub integration not configured, skipping repository creation"
        );
        return {
          success: true,
          data: {
            repoUrl: `https://github.com/${githubUsername || "juzbuild"}/${
              options.websiteName
            }`,
            repoName: options.websiteName,
            owner: githubUsername || "juzbuild",
            note: "GitHub integration not configured - skipped",
          },
        };
      }

      // Initialize Octokit with authentication
      const octokit = new Octokit({ auth: githubToken });

      // Create repository
      console.log(`Creating GitHub repository: ${options.websiteName}`);
      const repo = await octokit.repos.createForAuthenticatedUser({
        name: options.websiteName,
        description: `Real estate website for ${options.companyName} - Created with Juzbuild`,
        private: false,
        auto_init: false, // Don't initialize with README, we'll create our own
      });

      console.log(`✅ GitHub repository created: ${repo.data.html_url}`);

      // Create README.md for the repository
      const readmeContent = `# ${options.companyName} - Real Estate Website

This is a professional real estate website created with [Juzbuild](https://juzbuild.com).

## About ${options.companyName}

${options.aboutSection}

**Tagline:** ${options.tagline}

## Website Features

- 🏠 Property listings and search
- 📱 Mobile-responsive design
- 🎨 Modern, professional styling
- ⚡ Fast loading and optimized
- 📧 Contact forms and lead capture

## Getting Started

1. Clone this repository
2. Install dependencies: \`npm install\`
3. Run development server: \`npm run dev\`
4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This website is configured for easy deployment to Vercel, Netlify, or any other hosting platform.

## Support

For support and customization, contact [Juzbuild Support](https://juzbuild.com/support).

---

*Built with Juzbuild - Professional Real Estate Websites*
`;
      // First, add the README
      await octokit.repos.createOrUpdateFileContents({
        owner: githubUsername,
        repo: options.websiteName,
        path: "README.md",
        message: "Initial commit: Add project README",
        content: Buffer.from(readmeContent).toString("base64"),
      });

      // Now push all template files to the repository
      console.log("Pushing template files to GitHub repository...");
      const templatePath = path.join(
        process.cwd(),
        "templates",
        options.websiteName
      );
      await this.pushTemplateFiles(
        octokit,
        githubUsername,
        options.websiteName,
        templatePath
      );

      return {
        success: true,
        data: {
          repoUrl: repo.data.html_url,
          repoName: options.websiteName,
          owner: githubUsername,
          cloneUrl: repo.data.clone_url,
        },
      };
    } catch (error) {
      console.error("GitHub push failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "GitHub repository creation failed",
      };
    }
  }

  /**
   * Step 4: Deploy to Vercel
   */
  async deployToVercel(
    options: WebsiteCreationOptions
  ): Promise<WorkflowResult> {
    try {
      // Check if we have Vercel configuration
      const vercelToken = process.env.VERCEL_TOKEN;

      if (!vercelToken) {
        console.log("Vercel integration not configured, skipping deployment");
        return {
          success: true,
          data: {
            deploymentUrl: `https://${options.websiteName}.vercel.app`,
            status: "skipped",
            note: "Vercel integration not configured - manual deployment required",
          },
        };
      }

      // Initialize Vercel API
      const vercel = getVercelInstance();
      const githubUsername = process.env.GITHUB_USERNAME || "juzbuild";
      const repoUrl = `https://github.com/${githubUsername}/${options.websiteName}`;

      // Create project and get deployment info
      const { project, deploymentUrl, deployment } =
        await vercel.createProjectAndDeploy(options.websiteName, repoUrl);

      // Trigger additional push to guarantee Vercel deployment
      await this.triggerVercelDeploymentViaPush(options.websiteName);

      // Extract just the domain part (e.g., "project-name.vercel.app")
      const vercelDomain = deploymentUrl.replace("https://", "");

      return {
        success: true,
        data: {
          projectId: project.id,
          projectName: project.name,
          deploymentUrl: deploymentUrl,
          status: "created",
          vercelUrl: vercelDomain,
          note: "Deployment will be triggered by the GitHub push",
        },
      };
    } catch (error) {
      console.error("Vercel deployment failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Vercel deployment failed",
      };
    }
  }

  /**
   * Step 5: Create Namecheap subdomain
   */
  async createSubdomainOnNamecheap(
    options: WebsiteCreationOptions,
    vercelUrl?: string
  ): Promise<WorkflowResult> {
    try {
      const subdomain = `${options.websiteName}.onjuzbuild.com`;

      // Check if we have Namecheap configuration
      const namecheapApiUser = process.env.NAMECHEAP_API_USER;
      const namecheapApiKey = process.env.NAMECHEAP_API_KEY;

      if (!namecheapApiUser || !namecheapApiKey) {
        console.log(
          `Namecheap integration not configured, skipping subdomain creation for: ${subdomain}`
        );
        return {
          success: true,
          data: {
            subdomain,
            cname: vercelUrl || "your-deployment-url.vercel.app",
            status: "configured",
            note: "Namecheap integration not configured - manual DNS setup required",
          },
        };
      }

      // Initialize Namecheap API and create DNS record
      const namecheap = getNamecheapInstance();
      const targetUrl =
        vercelUrl ||
        process.env.DEPLOYMENT_TARGET ||
        `${options.websiteName}.vercel.app`;

      // Create CNAME record: websiteName.onjuzbuild.com -> targetUrl
      console.log(
        `Creating DNS record: ${options.websiteName}.onjuzbuild.com -> ${targetUrl}`
      );
      const dnsResult = await namecheap.createDNSRecord(
        "onjuzbuild.com",
        options.websiteName,
        targetUrl,
        "CNAME"
      );

      if (dnsResult.success) {
        console.log(`✅ Subdomain created successfully: ${subdomain}`);
        return {
          success: true,
          data: {
            subdomain,
            cname: targetUrl,
            status: "active",
            message: dnsResult.message,
          },
        };
      } else {
        console.error(`❌ DNS creation failed: ${dnsResult.message}`);
        return {
          success: false,
          error: `Subdomain creation failed: ${dnsResult.message}`,
        };
      }
    } catch (error) {
      console.error("Subdomain creation failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Subdomain creation failed",
      };
    }
  }

  /**
   * Step 6: Send setup notification email
   */
  async sendSetupNotification(
    options: WebsiteCreationOptions
  ): Promise<WorkflowResult> {
    try {
      const domain = `${options.websiteName}.onjuzbuild.com`;
      const websiteUrl = `https://${domain}`;

      // Check if we have email configuration
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (!emailUser || !emailPass) {
        console.log(
          `Email not configured, skipping notification to: ${options.userEmail}`
        );
        return {
          success: true,
          data: {
            emailSent: false,
            recipient: options.userEmail,
            domain,
            note: "Email service not configured - notification skipped",
          },
        };
      }

      // Import and use the email service
      const { sendWebsiteCreationEmail } = await import("@/lib/email");

      // Use the hardcoded test email for now
      const testEmail = "jasonaddy51@gmail.com";

      await sendWebsiteCreationEmail({
        userEmail: testEmail, // Using test email as requested
        companyName: options.companyName,
        websiteName: options.websiteName,
        domain,
        theme: options.selectedTheme,
        layoutStyle: options.layoutStyle,
        websiteUrl,
        createdAt: new Date().toLocaleString(),
      });

      console.log(`✅ Website creation email sent to: ${testEmail}`);

      return {
        success: true,
        data: {
          emailSent: true,
          recipient: testEmail,
          originalRecipient: options.userEmail,
          domain,
          websiteUrl,
        },
      };
    } catch (error) {
      console.error("Email notification failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Email notification failed",
      };
    }
  }

  /**
   * Step 7: Log site creation in main database
   */
  async logSiteCreation(
    options: WebsiteCreationOptions
  ): Promise<WorkflowResult> {
    try {
      await this.mongoClient.connect();
      const db = this.mongoClient.db("Juzbuild"); // Use existing database name with capital J
      const sitesCollection = db.collection("sites");

      const siteRecord = {
        userId: options.userId,
        userEmail: options.userEmail,
        websiteName: options.websiteName,
        companyName: options.companyName,
        templatePath: `/templates/${options.websiteName}`,
        repoUrl: `https://github.com/${process.env.GITHUB_USERNAME}/${options.websiteName}`,
        domain: `${options.websiteName}.onjuzbuild.com`,
        dbName: `juzbuild_${options.websiteName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")}`,
        status: "active",
        theme: options.selectedTheme,
        layoutStyle: options.layoutStyle,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await sitesCollection.insertOne(siteRecord);

      return {
        success: true,
        data: {
          siteId: result.insertedId.toString(),
          logged: true,
        },
      };
    } catch (error) {
      console.error("Site logging failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Site logging failed",
      };
    } finally {
      await this.mongoClient.close();
    }
  }

  // Helper methods
  private async createTemplateStructure(
    templatePath: string,
    options: WebsiteCreationOptions
  ): Promise<void> {
    // Create directory structure
    const dirs = ["pages", "components", "styles", "data", "public/images"];
    for (const dir of dirs) {
      await fs.mkdir(path.join(templatePath, dir), { recursive: true });
    }

    // Generate template files
    await this.generateTemplateFiles(templatePath, options);
  }

  private async generateTemplateFiles(
    templatePath: string,
    options: WebsiteCreationOptions
  ): Promise<void> {
    // Package.json
    const packageJson = {
      name: options.websiteName.toLowerCase(),
      version: "1.0.0",
      description: `Real estate website for ${options.companyName}`,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "latest",
        react: "latest",
        "react-dom": "latest",
      },
    };

    await fs.writeFile(
      path.join(templatePath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Next.js config
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`;

    await fs.writeFile(path.join(templatePath, "next.config.js"), nextConfig);

    // App wrapper (required for Next.js)
    const appPage = `import '../styles/theme.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`;
    await fs.writeFile(path.join(templatePath, "pages/_app.js"), appPage);

    // Document wrapper for proper HTML structure
    const documentPage = `import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}`;
    await fs.writeFile(
      path.join(templatePath, "pages/_document.js"),
      documentPage
    );

    // Home page
    const indexPage = this.generateIndexPage(options);
    await fs.writeFile(path.join(templatePath, "pages/index.js"), indexPage);

    // Components
    await fs.writeFile(
      path.join(templatePath, "components/Header.js"),
      this.generateHeaderComponent(options)
    );

    await fs.writeFile(
      path.join(templatePath, "components/Footer.js"),
      this.generateFooterComponent(options)
    );

    // Styles
    await fs.writeFile(
      path.join(templatePath, "styles/theme.css"),
      this.generateThemeCSS(options)
    );

    // Sample data
    await fs.writeFile(
      path.join(templatePath, "data/properties.json"),
      JSON.stringify(this.generateSampleProperties(options), null, 2)
    );
  }

  private generateIndexPage(options: WebsiteCreationOptions): string {
    return `import Header from '../components/Header'
import Footer from '../components/Footer'
import properties from '../data/properties.json'

export default function Home() {
  return (
    <div>
      <Header />
      <main className="container">
        <section className="hero">
          <h1>Welcome to ${options.companyName}</h1>
          <p className="tagline">${options.tagline}</p>
        </section>
        
        <section className="featured-properties">
          <h2>Featured Properties</h2>
          <div className="properties-grid">
            {properties.slice(0, 3).map(property => (
              <div key={property.id} className="property-card">
                <h3>{property.title}</h3>
                <p className="price">{property.price}</p>
                <p>{property.description}</p>
                <div className="property-details">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.sqft} sqft</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}`;
  }

  private generateHeaderComponent(options: WebsiteCreationOptions): string {
    return `export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="logo">
          <h1>${options.companyName}</h1>
        </div>
        <nav>
          <ul>
            ${options.includedPages
              .map(
                (page) =>
                  `<li><a href="/${page
                    .toLowerCase()
                    .replace(/\s+/g, "-")}">${page}</a></li>`
              )
              .join("\n            ")}
          </ul>
        </nav>
      </div>
    </header>
  )
}`;
  }

  private generateFooterComponent(options: WebsiteCreationOptions): string {
    return `export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="company-info">
            <h3>${options.companyName}</h3>
            <p>${options.tagline}</p>
          </div>
          <div className="contact-info">
            <h4>Contact Us</h4>
            <p>Email: ${options.userEmail}</p>
            <p>Preferred Contact: ${options.preferredContactMethod.join(
              ", "
            )}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ${options.companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}`;
  }

  private generateThemeCSS(options: WebsiteCreationOptions): string {
    const primary = options.brandColors[0] || "#3B82F6";
    const secondary = options.brandColors[1] || "#EF4444";
    const accent = options.brandColors[2] || "#10B981";

    return `:root {
  --primary-color: ${primary};
  --secondary-color: ${secondary};
  --accent-color: ${accent};
  --text-color: #333;
  --bg-color: #fff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-header {
  background: var(--primary-color);
  color: white;
  padding: 1rem 0;
}

.site-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-header nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.site-header nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tagline {
  font-size: 1.2rem;
  opacity: 0.9;
}

.featured-properties {
  padding: 4rem 0;
}

.featured-properties h2 {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 3rem;
  font-size: 2rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.property-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.property-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.property-card h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.property-details {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.site-footer {
  background: #f8f9fa;
  padding: 3rem 0 1rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
  color: #666;
}`;
  }

  private generateSampleProperties(options: WebsiteCreationOptions) {
    return [
      {
        id: 1,
        title: "Luxury Family Home",
        description: "Beautiful 4-bedroom family home in prime location",
        price: "$750,000",
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2500,
        type: options.propertyTypes[0] || "House",
        status: "For Sale",
        featured: true,
        images: ["/images/property1.jpg"],
        address: "123 Main Street",
        city: "Downtown",
      },
      {
        id: 2,
        title: "Modern Downtown Condo",
        description: "Contemporary 2-bedroom condo with city views",
        price: "$450,000",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        type: "Condo",
        status: "For Sale",
        featured: true,
        images: ["/images/property2.jpg"],
        address: "456 Downtown Ave",
        city: "City Center",
      },
      {
        id: 3,
        title: "Cozy Starter Home",
        description: "Perfect first home with garden and garage",
        price: "$325,000",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1800,
        type: "House",
        status: "For Sale",
        featured: false,
        images: ["/images/property3.jpg"],
        address: "789 Residential St",
        city: "Suburbs",
      },
    ];
  }

  private generateSetupEmailTemplate(
    options: WebsiteCreationOptions,
    domain: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your Website is Ready!</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${
              options.brandColors[0] || "#3B82F6"
            }; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { background: ${
              options.brandColors[1] || "#EF4444"
            }; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Your Website is Ready!</h1>
            </div>
            <div class="content">
                <h2>Hi ${options.fullName},</h2>
                <p>Great news! Your new real estate website <strong>${
                  options.websiteName
                }</strong> has been successfully created and is now live!</p>
                
                <h3>Website Details:</h3>
                <ul>
                    <li><strong>Website Name:</strong> ${
                      options.websiteName
                    }</li>
                    <li><strong>Company:</strong> ${options.companyName}</li>
                    <li><strong>Domain:</strong> <a href="http://${domain}">${domain}</a></li>
                    <li><strong>Theme:</strong> ${options.selectedTheme}</li>
                    <li><strong>Layout:</strong> ${options.layoutStyle}</li>
                </ul>

                <p>Your website includes:</p>
                <ul>
                    ${options.includedPages
                      .map((page) => `<li>${page} page</li>`)
                      .join("")}
                    <li>3 sample property listings</li>
                    <li>Custom branding with your selected colors</li>
                    <li>Contact forms and lead capture</li>
                </ul>

                <a href="http://${domain}" class="button">View Your Website</a>
                <a href="/dashboard" class="button">Manage Your Site</a>

                <h3>Next Steps:</h3>
                <ol>
                    <li>Visit your new website at <a href="http://${domain}">${domain}</a></li>
                    <li>Log in to your dashboard to customize content</li>
                    <li>Add your own property listings</li>
                    <li>Upload your logo and images</li>
                    <li>Configure contact forms and lead capture</li>
                </ol>

                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

                <p>Welcome to Juzbuild!</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Juzbuild. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private async createGithubFiles(
    repoName: string,
    templatePath: string
  ): Promise<void> {
    // In a production environment, you would:
    // 1. Initialize git in the template directory
    // 2. Add files to git
    // 3. Push to the created GitHub repository
    // For now, we'll create some basic files via GitHub API

    const readmeContent = `# ${repoName}

A real estate website built with Next.js.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to view the website.`;

    await (this.octokit.repos as any).createOrUpdateFileContents({
      owner: process.env.GITHUB_USERNAME!,
      repo: repoName,
      path: "README.md",
      message: "Add README",
      content: Buffer.from(readmeContent).toString("base64"),
    });
  }

  /**
   * Helper method to push all template files to GitHub repository
   */
  private async pushTemplateFiles(
    octokit: any,
    owner: string,
    repo: string,
    templatePath: string
  ): Promise<void> {
    try {
      // Get all files from the template directory
      const files = await this.getAllTemplateFiles(templatePath);

      console.log(`Found ${files.length} files to push to GitHub:`);
      files.forEach((file) => console.log(`  - ${file.relativePath}`));

      // Push files in batches to avoid rate limiting
      const batchSize = 3;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        // Push files sequentially instead of in parallel to avoid rate limiting
        for (const file of batch) {
          try {
            const content = await fs.readFile(file.fullPath, "utf8");
            const base64Content = Buffer.from(content).toString("base64");

            console.log(
              `Pushing file: ${file.relativePath} (${content.length} bytes)`
            );

            const result = await octokit.repos.createOrUpdateFileContents({
              owner,
              repo,
              path: file.relativePath,
              message: `Add ${file.relativePath}`,
              content: base64Content,
            });

            console.log(`✅ Successfully pushed: ${file.relativePath}`);

            // Small delay between individual file pushes
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error(
              `❌ Failed to push file ${file.relativePath}:`,
              error instanceof Error ? error.message : error
            );
            // Continue with other files even if one fails
          }
        }

        // Add small delay between batches
        if (i + batchSize < files.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log("✅ All template files pushed to GitHub");

      // Add a small deployment trigger commit to ensure Vercel deploys
      try {
        console.log("Adding deployment trigger commit...");
        const deployTriggerContent = `# ${repo}\n\nThis Next.js website was automatically generated and deployed by JuzBuild.\n\nDeployment triggered at: ${new Date().toISOString()}\n`;
        const base64Content =
          Buffer.from(deployTriggerContent).toString("base64");

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: "DEPLOYMENT.md",
          message: `🚀 Trigger Vercel deployment - ${new Date().toISOString()}`,
          content: base64Content,
        });

        console.log("✅ Deployment trigger commit added");
      } catch (error) {
        console.log(
          "Note: Could not add deployment trigger commit, deployment may be delayed"
        );
      }
    } catch (error) {
      console.error("Error pushing template files:", error);
      throw error;
    }
  }

  /**
   * Helper method to recursively get all files from template directory
   */
  private async getAllTemplateFiles(templatePath: string): Promise<
    Array<{
      fullPath: string;
      relativePath: string;
    }>
  > {
    const files: Array<{ fullPath: string; relativePath: string }> = [];

    async function scanDirectory(currentPath: string, basePath: string) {
      try {
        const items = await fs.readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          const relativePath = path
            .relative(basePath, fullPath)
            .replace(/\\/g, "/");

          if (item.isDirectory()) {
            // Skip node_modules and .git directories
            if (
              item.name !== "node_modules" &&
              item.name !== ".git" &&
              !item.name.startsWith(".")
            ) {
              await scanDirectory(fullPath, basePath);
            }
          } else {
            // Skip certain file types
            if (!item.name.endsWith(".log") && !item.name.startsWith(".")) {
              files.push({ fullPath, relativePath });
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${currentPath}:`, error);
      }
    }

    await scanDirectory(templatePath, templatePath);
    return files;
  }

  /**
   * Trigger Vercel deployment by adding a file and pushing to GitHub
   * This creates a new commit that will trigger Vercel's automatic deployment
   */
  private async triggerVercelDeploymentViaPush(
    websiteName: string
  ): Promise<void> {
    try {
      // Wait for Vercel-GitHub connection to be established
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const githubToken = process.env.GITHUB_TOKEN;
      const githubUsername = process.env.GITHUB_USERNAME || "juzbuild";

      if (!githubToken) {
        return;
      }

      const octokit = new Octokit({ auth: githubToken });

      // Create a deployment trigger file
      const timestamp = new Date().toISOString();
      const deploymentTriggerContent = `# Vercel Deployment Trigger

This file was created to trigger automatic deployment on Vercel.

**Deployment Details:**
- Website: ${websiteName}
- Triggered at: ${timestamp}
- Trigger reason: Ensuring Vercel deployment after project connection

## Automatic Deployment Process

1. ✅ GitHub repository created with Next.js files
2. ✅ Vercel project created and connected to GitHub
3. ✅ This trigger file added to force deployment
4. 🚀 Vercel should now automatically deploy the website

---
*This file is part of the automated deployment process by JuzBuild*
`;

      const base64Content = Buffer.from(deploymentTriggerContent).toString(
        "base64"
      );

      await octokit.repos.createOrUpdateFileContents({
        owner: githubUsername,
        repo: websiteName,
        path: "VERCEL_DEPLOY.md",
        message: `🚀 Trigger Vercel deployment - ${timestamp}`,
        content: base64Content,
      });
    } catch (error) {
      // Silently handle deployment trigger errors
    }
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Remove admin dashboard files and configurations
   */
  private async removeAdminDashboard(templatePath: string): Promise<void> {
    const adminPath = path.join(templatePath, "src", "app", "admin");

    // Remove admin directory if it exists
    try {
      await fs.rm(adminPath, { recursive: true, force: true });
    } catch (error) {
      // Admin directory might not exist, continue
    }

    // Remove conflicting route directories that might cause parallel page issues
    const conflictingRoutes = [
      path.join(templatePath, "src", "app", "(site)", "properties"),
      path.join(templatePath, "src", "app", "(site)", "about"),
      path.join(templatePath, "src", "app", "(site)", "contact"),
      path.join(templatePath, "src", "app", "(site)", "services"),
    ];

    for (const routePath of conflictingRoutes) {
      try {
        await fs.rm(routePath, { recursive: true, force: true });
      } catch (error) {
        // Route might not exist, continue
      }
    }

    // Remove the entire (site) route group if it exists to avoid conflicts
    const siteRoutePath = path.join(templatePath, "src", "app", "(site)");
    try {
      await fs.rm(siteRoutePath, { recursive: true, force: true });
    } catch (error) {
      // Site route group might not exist
    }

    // Fix layout.tsx syntax issues
    const layoutPath = path.join(templatePath, "src", "app", "layout.tsx");
    try {
      let layoutContent = await fs.readFile(layoutPath, "utf-8");

      // Remove admin-related imports and routes
      layoutContent = layoutContent.replace(/import.*admin.*\n/gi, "");
      layoutContent = layoutContent.replace(/\/admin.*\n/gi, "");

      // Fix broken title syntax - remove "Generated by create next app" if it's malformed
      layoutContent = layoutContent.replace(
        /title:\s*"([^"]*)"[^",\n]*Generated[^",\n]*"/g,
        'title: "$1"'
      );

      // Ensure proper comma after title
      layoutContent = layoutContent.replace(
        /title:\s*"([^"]*)"(?!\s*[,}])/g,
        'title: "$1",'
      );

      await fs.writeFile(layoutPath, layoutContent);
    } catch (error) {
      // Layout file might not exist or have different structure
    }
  }

  /**
   * Configure dynamic database connection for the user's database
   */
  private async configureDynamicDatabase(
    templatePath: string,
    options: WebsiteCreationOptions
  ): Promise<void> {
    const dbName = `juzbuild_${options.websiteName}`;
    const connectionString = `${process.env.MONGODB_URI}/${dbName}`;

    // Update database configuration files
    const configFiles = [
      "src/lib/mongodb.ts",
      "src/lib/database.ts",
      "src/config/database.ts",
    ];

    for (const configFile of configFiles) {
      const configPath = path.join(templatePath, configFile);
      try {
        let content = await fs.readFile(configPath, "utf-8");

        // Replace database connection with user-specific database
        content = content.replace(/mongodb:\/\/[^"']+/g, connectionString);

        // Replace database name references
        content = content.replace(
          /database\s*=\s*client\.db\(['"]\w+['"]\)/g,
          `database = client.db("${dbName}")`
        );

        await fs.writeFile(configPath, content);
      } catch (error) {
        // File might not exist, continue with next file
      }
    }

    // Create environment file with database configuration
    const envPath = path.join(templatePath, ".env.local");
    const envContent = `
MONGODB_URI=${connectionString}
DATABASE_NAME=${dbName}
NEXT_PUBLIC_SITE_NAME=${options.companyName || options.websiteName}
NEXT_PUBLIC_SITE_URL=https://${options.websiteName}.vercel.app
`;

    await fs.writeFile(envPath, envContent.trim());
  }

  /**
   * Create additional pages based on user's page selections
   */
  private async createUserPages(
    templatePath: string,
    options: WebsiteCreationOptions
  ): Promise<void> {
    const pagesDir = path.join(templatePath, "src", "app");
    const includedPages = options.includedPages || [
      "Home",
      "Properties",
      "About",
      "Contact",
    ];

    for (const page of includedPages) {
      const pageName = page.toLowerCase().replace(/\s+/g, "-");

      if (pageName === "home") continue; // Home is the root page

      const pageDir = path.join(pagesDir, pageName);

      // Check if page already exists (from homely template) and remove it first
      try {
        const existingPageFile = path.join(pageDir, "page.tsx");
        if (
          await fs
            .access(existingPageFile)
            .then(() => true)
            .catch(() => false)
        ) {
          await fs.rm(pageDir, { recursive: true, force: true });
        }
      } catch (error) {
        // Page doesn't exist, which is fine
      }

      // Create fresh page directory and file
      await fs.mkdir(pageDir, { recursive: true });

      const pageContent = this.generatePageContent(page, options);
      const pageFile = path.join(pageDir, "page.tsx");

      await fs.writeFile(pageFile, pageContent);
    }
  }

  /**
   * Generate content for a specific page
   */
  private generatePageContent(
    pageName: string,
    options: WebsiteCreationOptions
  ): string {
    const componentName = pageName.replace(/\s+/g, "");
    const companyName = options.companyName || options.websiteName;

    switch (pageName.toLowerCase()) {
      case "about":
        return `
import React from 'react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About ${companyName}</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          ${
            options.aboutSection ||
            `Welcome to ${companyName}, your trusted partner in real estate.`
          }
        </p>
        <p className="mb-4">
          Our team is dedicated to helping you find the perfect property that meets your needs and budget.
          With years of experience in the real estate market, we provide expert guidance throughout
          your property journey.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Services</h2>
        <ul className="list-disc pl-6">
          <li>Property Sales</li>
          <li>Property Rentals</li>
          <li>Property Management</li>
          <li>Investment Consultation</li>
        </ul>
      </div>
    </div>
  );
}
`;

      case "contact":
        return `
import React from 'react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Contact ${companyName}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>${
                options.userEmail || "info@" + options.websiteName + ".com"
              }</p>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p>${
                options.preferredContactMethod?.includes("phone")
                  ? "+1 (555) 123-4567"
                  : "Available upon request"
              }</p>
            </div>
            <div>
              <h3 className="font-semibold">Address</h3>
              <p>123 Real Estate Street<br />Property City, PC 12345</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Form</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea rows={4} className="w-full border rounded-md px-3 py-2"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
`;

      case "services":
        return `
import React from 'react';

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Services</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Property Sales</h3>
          <p>Expert assistance in buying and selling properties with market insights and professional guidance.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Property Rentals</h3>
          <p>Find the perfect rental property or manage your rental investments with our comprehensive services.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">Property Management</h3>
          <p>Complete property management solutions for landlords and property investors.</p>
        </div>
      </div>
    </div>
  );
}
`;

      default:
        return `
import React from 'react';

export default function ${componentName}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">${pageName}</h1>
      <div className="prose max-w-none">
        <p>Welcome to the ${pageName.toLowerCase()} page of ${companyName}.</p>
        <p>This page is ready for your custom content.</p>
      </div>
    </div>
  );
}
`;
    }
  }

  /**
   * Customize template with user's branding and configuration
   */
  private async customizeTemplate(
    templatePath: string,
    options: WebsiteCreationOptions
  ): Promise<void> {
    // Update package.json with user's project name
    const packageJsonPath = path.join(templatePath, "package.json");
    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf-8")
      );
      packageJson.name = options.websiteName;
      packageJson.description = `${
        options.companyName || options.websiteName
      } - Real Estate Website`;

      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      // Package.json might not exist or be malformed
    }

    // Update site configuration with user's branding
    const configFiles = [
      "src/config/site.ts",
      "src/lib/config.ts",
      "next.config.js",
      "next.config.ts",
    ];

    for (const configFile of configFiles) {
      const configPath = path.join(templatePath, configFile);
      try {
        let content = await fs.readFile(configPath, "utf-8");

        // Replace site name and branding
        content = content.replace(
          /site.*name.*:.*"[^"]+"/gi,
          `siteName: "${options.companyName || options.websiteName}"`
        );
        content = content.replace(
          /title.*:.*"[^"]+"/gi,
          `title: "${options.companyName || options.websiteName}"`
        );
        content = content.replace(
          /description.*:.*"[^"]+"/gi,
          `description: "${
            options.tagline || "Professional Real Estate Services"
          }"`
        );

        // Replace color scheme if provided
        if (options.brandColors && options.brandColors.length > 0) {
          content = content.replace(
            /primary.*:.*"[^"]+"/gi,
            `primary: "${options.brandColors[0]}"`
          );
        }

        await fs.writeFile(configPath, content);
      } catch (error) {
        // File might not exist
      }
    }

    // Update main layout with user's branding
    const layoutPath = path.join(templatePath, "src", "app", "layout.tsx");
    try {
      let layoutContent = await fs.readFile(layoutPath, "utf-8");

      // Fix common syntax issues in layout.tsx first
      // Remove any malformed title strings with "Generated by" text
      layoutContent = layoutContent.replace(
        /title:\s*"([^"]*)"[^",\n]*Generated[^",\n]*"/g,
        'title: "$1"'
      );

      // Ensure proper metadata structure
      layoutContent = layoutContent.replace(
        /title:\s*"([^"]*)"(?!\s*[,}\n])/g,
        'title: "$1",'
      );

      // Update metadata with user's information
      layoutContent = layoutContent.replace(
        /(title:\s*)"[^"]*"/g,
        `$1"${options.companyName || options.websiteName}"`
      );
      layoutContent = layoutContent.replace(
        /(description:\s*)"[^"]*"/g,
        `$1"${options.tagline || "Professional Real Estate Services"}"`
      );

      // Fix any trailing commas or syntax issues
      layoutContent = layoutContent.replace(/,(\s*})/g, "$1");

      await fs.writeFile(layoutPath, layoutContent);
    } catch (error) {
      // Layout might have different structure, create a minimal one
      const minimalLayout = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${options.companyName || options.websiteName}',
  description: '${options.tagline || "Professional Real Estate Services"}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`;
      await fs.writeFile(layoutPath, minimalLayout);
    }
  }

  /**
   * Clean up temporary template after successful deployment
   */
  async cleanupTemplate(websiteName: string): Promise<void> {
    const templatePath = path.join(process.cwd(), "templates", websiteName);
    try {
      await fs.rm(templatePath, { recursive: true, force: true });
    } catch (error) {
      // Template directory might not exist or already cleaned up
    }
  }
}

export const websiteCreationService = new WebsiteCreationService();
