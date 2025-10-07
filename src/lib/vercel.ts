// Vercel SDK integration for automated deployment
// Documentation: https://vercel.com/docs/rest-api
import { Vercel } from "@vercel/sdk";

interface VercelConfig {
  token: string;
  teamId?: string;
}

interface VercelDeployment {
  id: string;
  url: string;
  status: string;
  readyState: string;
  alias?: string[];
}

interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  framework: string;
  devCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
}

class VercelAPI {
  private vercel: Vercel;
  private config: VercelConfig;

  constructor(config: VercelConfig) {
    this.config = config;
    this.vercel = new Vercel({
      bearerToken: config.token,
    });
  }

  /**
   * Create a new project on Vercel
   * @param name - Project name
   * @param gitUrl - Git repository URL
   * @param framework - Framework preset (nextjs, react, etc.)
   * @returns Promise with project details
   */
  async createProject(
    name: string,
    gitUrl: string,
    framework: string = "nextjs"
  ): Promise<VercelProject> {
    const repoPath = gitUrl.replace("https://github.com/", "");

    const result = await this.vercel.projects.createProject({
      requestBody: {
        name,
        gitRepository: {
          type: "github",
          repo: repoPath,
        },
        framework: "nextjs" as const,
        buildCommand: "npm run build",
        devCommand: "npm run dev",
        outputDirectory: ".next",
        installCommand: "npm install",
      },
    });

    return {
      id: result.id!,
      name: result.name!,
      accountId: result.accountId!,
      framework: result.framework || framework,
      devCommand: result.devCommand || "npm run dev",
      buildCommand: result.buildCommand || "npm run build",
      outputDirectory: result.outputDirectory || ".next",
    };
  }

  /**
   * Create project and trigger deployment using official Vercel SDK
   * @param projectName - Name of the project
   * @param gitUrl - Git repository URL
   * @returns Promise with project and deployment info
   */
  async createProjectAndDeploy(
    projectName: string,
    gitUrl: string
  ): Promise<{
    project: VercelProject;
    deploymentUrl: string;
    deployment?: VercelDeployment;
  }> {
    // Create the project first
    const project = await this.createProject(projectName, gitUrl);

    // Wait for project setup to complete
    await new Promise((resolve) => setTimeout(resolve, 5000));

    let deployment: VercelDeployment | undefined;

    try {
      // Create deployment using the official SDK approach
      deployment = await this.createDeploymentFromGit(projectName, gitUrl);
    } catch (error) {
      // Vercel will auto-deploy from GitHub integration
    }

    // Return the expected deployment URL
    const deploymentUrl = `https://${projectName}.vercel.app`;

    return {
      project,
      deploymentUrl,
      deployment,
    };
  }

  /**
   * Create a deployment directly from Git repository
   * @param projectName - Name of the project
   * @param gitUrl - Git repository URL
   * @returns Promise with deployment details
   */
  async createDeploymentFromGit(
    projectName: string,
    gitUrl: string
  ): Promise<VercelDeployment> {
    const repoPath = gitUrl.replace("https://github.com/", "");
    const [orgName, repoName] = repoPath.split("/");

    const result = await this.vercel.deployments.createDeployment({
      requestBody: {
        name: projectName,
        target: "production",
        gitSource: {
          type: "github",
          repo: repoName,
          ref: "main",
          org: orgName,
        },
      },
    });

    return {
      id: result.id!,
      url: result.url!,
      status: result.status || "QUEUED",
      readyState: result.readyState || "QUEUED",
      alias: result.alias,
    };
  }

  /**
   * Get project deployments using official SDK
   * @param projectId - Vercel project ID
   * @returns Promise with deployments list
   */
  async getProjectDeployments(projectId: string): Promise<any[]> {
    try {
      const result = await this.vercel.deployments.getDeployments({
        projectId: projectId,
        limit: 5,
      });
      return result.deployments || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get deployment status using official SDK
   * @param deploymentId - Deployment ID
   * @returns Promise with deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<VercelDeployment> {
    try {
      const result = await this.vercel.deployments.getDeployment({
        idOrUrl: deploymentId,
      });

      return {
        id: result.id!,
        url: result.url!,
        status: result.status || "UNKNOWN",
        readyState: result.readyState || "UNKNOWN",
        alias: result.alias,
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export the class and types
export {
  VercelAPI,
  type VercelConfig,
  type VercelDeployment,
  type VercelProject,
};

// Create and export a singleton instance if environment variables are available
let vercelInstance: VercelAPI | null = null;

export function getVercelInstance(): VercelAPI {
  if (!vercelInstance) {
    const config: VercelConfig = {
      token: process.env.VERCEL_TOKEN || "",
      teamId: process.env.VERCEL_TEAM_ID,
    };

    // Validate required config
    if (!config.token) {
      throw new Error(
        "Missing required Vercel API configuration. Please set VERCEL_TOKEN environment variable."
      );
    }

    vercelInstance = new VercelAPI(config);
  }

  return vercelInstance;
}
