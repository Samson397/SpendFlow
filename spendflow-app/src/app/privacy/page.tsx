'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Add any initialization logic here
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-900/30 rounded-full">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">1. Introduction</h2>
            <p className="text-slate-300">
              Welcome to SpendFlow ("we," "our," or "us"). We are committed to protecting your personal data and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application.
            </p>
          </section>

          {/* NO SELLING/SHARING/TRACKING - PROMINENT SECTION */}
          <section className="bg-amber-900/20 border-2 border-amber-500 rounded-lg p-6">
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-3xl">🔒</span>
              Our Privacy Commitment
            </h2>
            <div className="space-y-3 text-slate-300">
              <p className="text-lg font-semibold text-amber-400">
                We want to be absolutely clear:
              </p>
              <ul className="space-y-2 text-base">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 text-xl shrink-0">✓</span>
                  <span><strong>We do NOT sell your data</strong> - Your information is never sold to third parties, advertisers, or data brokers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 text-xl shrink-0">✓</span>
                  <span><strong>We do NOT share your data</strong> - Your financial information stays private and is never shared with external companies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 text-xl shrink-0">✓</span>
                  <span><strong>We do NOT track you</strong> - No third-party tracking pixels, no advertising networks, no cross-site tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 text-xl shrink-0">✓</span>
                  <span><strong>Your data is yours</strong> - You can export or delete your data at any time, no questions asked.</span>
                </li>
              </ul>
              <p className="text-sm italic mt-4 text-slate-400">
                We only use your data to provide you with the best financial management experience. That's it.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">2. Data Controller</h2>
            <p className="text-slate-300">
              For the purposes of the UK Data Protection Act 2018 and the EU General Data Protection Regulation (GDPR), the data controller is:
            </p>
            <address className="not-italic mt-2 text-slate-300">
              SpendFlow Ltd.<br />
              United Kingdom<br />
              Email: spendflowapp@gmail.com
            </address>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">3. Information We Collect</h2>
            <p className="text-slate-300">
              We collect several types of information from and about users of our application, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Basic account information (name, email address)</li>
              <li>Transaction data (amounts, categories, dates - but not payment details)</li>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
            </ul>
            <p className="mt-4 text-slate-300">
              <strong>Important:</strong> We do not collect or store credit/debit card details or phone numbers. All payment processing is handled by secure third-party payment processors, and we only receive confirmation of transactions, not the payment details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-slate-300">
              Under GDPR, we rely on the following legal bases for processing your personal data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Performance of a contract with you</li>
              <li>Your consent (where required)</li>
              <li>Compliance with legal obligations</li>
              <li>Legitimate interests pursued by us or a third party</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">5. Your Data Protection Rights</h2>
            <p className="text-slate-300">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li><strong>Right to access</strong> - Request copies of your personal data</li>
              <li><strong>Right to rectification</strong> - Request correction of inaccurate data</li>
              <li><strong>Right to erasure</strong> - Request deletion of your data</li>
              <li><strong>Right to restrict processing</strong> - Limit how we use your data</li>
              <li><strong>Right to data portability</strong> - Request transfer of your data</li>
              <li><strong>Right to object</strong> - Object to our processing of your data</li>
            </ul>
            <p className="mt-4 text-slate-300">
              To exercise these rights, please contact us at privacy@spendflow.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">6. Data Security</h2>
            <p className="text-slate-300">
              We implement appropriate technical and organizational measures to protect your personal data, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Staff training on data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">7. Data Retention</h2>
            <p className="text-slate-300">
              We retain your personal data only for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">8. International Data Transfers</h2>
            <p className="text-slate-300">
              Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place for these transfers as required by applicable data protection laws, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Standard contractual clauses approved by the European Commission</li>
              <li>Adequacy decisions for specific countries</li>
              <li>Other legally compliant transfer mechanisms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">9. Cookies and Tracking Technologies</h2>
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-4">
              <p className="text-blue-300 font-semibold">
                ✓ We do NOT use third-party tracking, advertising pixels, or cross-site tracking cookies.
              </p>
            </div>
            <p className="text-slate-300">
              We only use essential cookies for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li><strong>Authentication</strong> - Keep you logged in securely (Firebase)</li>
              <li><strong>Preferences</strong> - Remember your settings (currency, theme)</li>
              <li><strong>Security</strong> - Prevent fraud and protect your account</li>
            </ul>
            <p className="mt-4 text-slate-300">
              We do not use cookies for advertising, marketing, or tracking your behavior across other websites. 
              You can control cookies through your browser settings, though disabling essential cookies will affect functionality.
            </p>
            <p className="mt-2 text-slate-300">
              See our <Link href="/cookies" className="text-amber-400 underline hover:text-amber-300">Cookie Policy</Link> for more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">10. Third-Party Disclosures</h2>
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4">
              <p className="text-green-300 font-semibold">
                ✓ We do NOT sell, share, or trade your data with third parties for marketing, advertising, or any commercial purposes.
              </p>
            </div>
            <p className="text-slate-300">
              We only work with ONE third-party service:
            </p>
            <div className="bg-slate-800 rounded-lg p-4 my-4">
              <p className="text-slate-300 font-semibold mb-2">
                <strong>Firebase (Google Cloud)</strong> - For essential infrastructure only:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                <li>Authentication (secure login)</li>
                <li>Database (Firestore - encrypted storage)</li>
                <li>Hosting (secure delivery)</li>
              </ul>
              <p className="text-slate-400 text-sm mt-2 italic">
                Firebase does NOT use your data for advertising, analytics, or any other Google services. Your data stays in our isolated database.
              </p>
            </div>
            <p className="text-slate-300">
              We may share your information only when:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li><strong>Legal Requirements</strong> - Required by law, court order, or legal process</li>
              <li><strong>Safety & Security</strong> - To protect your safety or prevent fraud</li>
            </ul>
            <p className="mt-4 text-slate-300 font-semibold">
              That's it. No other third parties. No advertisers. No data brokers. No marketing companies. No tracking networks. No analytics services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">11. Children's Privacy</h2>
            <p className="text-slate-300">
              Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">12. Automated Decision Making</h2>
            <p className="text-slate-300">
              We may use automated decision-making processes to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Detect and prevent fraud</li>
              <li>Assess credit risk</li>
              <li>Personalize your experience</li>
            </ul>
            <p className="mt-4 text-slate-300">
              You have the right to request human intervention, express your point of view, and contest the decision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">13. Data Breach Procedures</h2>
            <p className="text-slate-300">
              In the event of a data breach, we will:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Contain the breach and assess the risks</li>
              <li>Notify affected individuals and relevant authorities when required</li>
              <li>Take steps to mitigate any harm</li>
              <li>Review and improve our security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">14. Your Choices and Controls</h2>
            <p className="text-slate-300">
              You can exercise control over your personal data by:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
              <li>Updating your account information in the app settings</li>
              <li>Adjusting your notification preferences</li>
              <li>Using browser controls to manage cookies</li>
              <li>Contacting us to exercise your data protection rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">15. Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">16. Contact Us</h2>
            <p className="text-slate-300">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <address className="not-italic mt-2 text-slate-300">
              Email: spendflowapp@gmail.com<br />
              United Kingdom
            </address>
            <p className="mt-4 text-slate-300">
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues (www.ico.org.uk).
            </p>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
}
