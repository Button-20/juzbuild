import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Homely Real Estate",
  description: "Terms and conditions for using Homely Real Estate services.",
};

const TermsOfService = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-2">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-dark dark:text-white">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Homely Real Estate services, you accept and
            agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Homely
            Real Estate for personal, non-commercial transitory viewing only.
            This is the grant of a license, not a transfer of title, and under
            this license you may not:
          </p>
          <ul>
            <li>modify or copy the materials</li>
            <li>
              use the materials for any commercial purpose or for any public
              display
            </li>
            <li>
              attempt to reverse engineer any software contained on the website
            </li>
            <li>
              remove any copyright or other proprietary notations from the
              materials
            </li>
          </ul>

          <h2>3. Property Listings</h2>
          <p>
            All property listings are provided for informational purposes. While
            we strive to maintain accurate information, property details,
            availability, and pricing may change without notice.
          </p>

          <h2>4. User Accounts</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            account credentials and for all activities that occur under their
            account.
          </p>

          <h2>5. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy,
            which also governs your use of our services.
          </p>

          <h2>6. Disclaimer</h2>
          <p>
            The materials on Homely Real Estate are provided on an &apos;as
            is&apos; basis. We make no warranties, expressed or implied, and
            hereby disclaim and negate all other warranties including without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at
            legal@homelyrealestate.com
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
