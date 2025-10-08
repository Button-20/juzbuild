import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Homely Real Estate",
  description:
    "Privacy policy explaining how we collect, use, and protect your personal information.",
};

const PrivacyPolicy = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-2">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-dark dark:text-white">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="lead">Last updated: September 3, 2025</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, contact us, or use our services. This may
            include:
          </p>
          <ul>
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Property preferences and search history</li>
            <li>Communication preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our real estate services</li>
            <li>Send you property listings and updates</li>
            <li>Communicate with you about our services</li>
            <li>Personalize your experience on our platform</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information with:
          </p>
          <ul>
            <li>
              Real estate agents and property owners when you express interest
              in a property
            </li>
            <li>Service providers who help us operate our platform</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction.
          </p>

          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing
            experience, analyze site usage, and assist in our marketing efforts.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>

          <h2>7. Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any significant changes by posting the new policy on this
            page.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at:
          </p>
          <p>
            Email: privacy@homelyrealestate.com
            <br />
            Address: 123 Real Estate Ave, Property City, PC 12345
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
