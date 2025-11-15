import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TERMS_OF_SERVICE = `<h2>Terms of Service</h2>
<p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>

<h3>1. Acceptance of Terms</h3>
<p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use this service.</p>

<h3>2. Use of Service</h3>
<p>Our real estate services are provided for informational and communication purposes. You agree to:</p>
<ul>
  <li>Provide accurate and complete information</li>
  <li>Use the service only for lawful purposes</li>
  <li>Not interfere with or disrupt the service</li>
  <li>Not attempt to gain unauthorized access to any part of the service</li>
</ul>

<h3>3. Property Information</h3>
<p>While we strive to provide accurate property information, we make no warranties or representations about the accuracy, reliability, or completeness of any property listings or information provided through this service.</p>

<h3>4. User Content</h3>
<p>By submitting information or content through our service, you grant us the right to use, reproduce, and display such content for the purpose of providing our services.</p>

<h3>5. Intellectual Property</h3>
<p>All content on this website, including text, graphics, logos, images, and software, is the property of our company or its content suppliers and is protected by intellectual property laws.</p>

<h3>6. Third-Party Links</h3>
<p>Our service may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party sites.</p>

<h3>7. Limitation of Liability</h3>
<p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>

<h3>8. Indemnification</h3>
<p>You agree to indemnify and hold us harmless from any claims, losses, damages, liabilities, and expenses arising from your use of the service or violation of these terms.</p>

<h3>9. Modifications to Service</h3>
<p>We reserve the right to modify or discontinue the service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.</p>

<h3>10. Changes to Terms</h3>
<p>We may revise these Terms of Service at any time. By continuing to use the service after changes are posted, you agree to be bound by the revised terms.</p>

<h3>11. Governing Law</h3>
<p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.</p>

<h3>12. Contact Information</h3>
<p>If you have any questions about these Terms of Service, please contact us through the contact information provided on our website.</p>`;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Get user's website URL from the database
    const webwebsitesCollection = await getCollection("websites");
    const site = await webwebsitesCollection.findOne({
      userId: userId,
      status: "active",
    });

    if (!site) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    // Use websiteUrl if available, otherwise construct from domain
    const websiteUrl = site.websiteUrl || `https://${site.domain}`;

    const response = await fetch(`${websiteUrl}/api/pages/terms-of-service`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If page doesn't exist, return default content
      return NextResponse.json({
        success: true,
        content: DEFAULT_TERMS_OF_SERVICE,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      content: data.page?.content || DEFAULT_TERMS_OF_SERVICE,
    });
  } catch (error) {
    console.error("Error fetching terms of service:", error);
    return NextResponse.json(
      { error: "Failed to fetch terms of service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Get user's website URL from the database
    const webwebsitesCollection = await getCollection("websites");
    const site = await webwebsitesCollection.findOne({
      userId: userId,
      status: "active",
    });

    if (!site) {
      return NextResponse.json(
        { error: "No active website found" },
        { status: 404 }
      );
    }

    // Use websiteUrl if available, otherwise construct from domain
    const websiteUrl = site.websiteUrl || `https://${site.domain}`;

    const response = await fetch(`${websiteUrl}/api/pages/terms-of-service`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update terms of service");
    }

    return NextResponse.json({
      success: true,
      message: "Terms of service updated successfully",
    });
  } catch (error) {
    console.error("Error updating terms of service:", error);
    return NextResponse.json(
      { error: "Failed to update terms of service" },
      { status: 500 }
    );
  }
}
