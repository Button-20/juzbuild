import { verifyToken } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PRIVACY_POLICY = `<h2>Privacy Policy</h2>
<p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>

<h3>1. Information We Collect</h3>
<p>We collect information that you provide directly to us, including:</p>
<ul>
  <li>Name and contact information</li>
  <li>Property preferences and search criteria</li>
  <li>Communication preferences</li>
  <li>Any other information you choose to provide</li>
</ul>

<h3>2. How We Use Your Information</h3>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide and improve our real estate services</li>
  <li>Send you property listings and updates</li>
  <li>Respond to your inquiries and requests</li>
  <li>Communicate with you about our services</li>
  <li>Comply with legal obligations</li>
</ul>

<h3>3. Information Sharing</h3>
<p>We do not sell your personal information. We may share your information with:</p>
<ul>
  <li>Service providers who assist us in operating our business</li>
  <li>Professional advisors and auditors</li>
  <li>Law enforcement when required by law</li>
</ul>

<h3>4. Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h3>5. Your Rights</h3>
<p>You have the right to:</p>
<ul>
  <li>Access and receive a copy of your personal information</li>
  <li>Request correction of inaccurate information</li>
  <li>Request deletion of your information</li>
  <li>Object to processing of your information</li>
  <li>Withdraw consent at any time</li>
</ul>

<h3>6. Cookies and Tracking</h3>
<p>We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>

<h3>7. Changes to This Policy</h3>
<p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

<h3>8. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us through the contact information provided on our website.</p>`;

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

    const response = await fetch(`${websiteUrl}/api/pages/privacy-policy`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If page doesn't exist, return default content
      return NextResponse.json({
        success: true,
        content: DEFAULT_PRIVACY_POLICY,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      content: data.page?.content || DEFAULT_PRIVACY_POLICY,
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return NextResponse.json(
      { error: "Failed to fetch privacy policy" },
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

    const response = await fetch(`${websiteUrl}/api/pages/privacy-policy`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update privacy policy");
    }

    return NextResponse.json({
      success: true,
      message: "Privacy policy updated successfully",
    });
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    return NextResponse.json(
      { error: "Failed to update privacy policy" },
      { status: 500 }
    );
  }
}
