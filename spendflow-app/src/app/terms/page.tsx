'use client';

export default function TermsOfService() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-900/30 rounded-full">
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100 mb-2">
            Terms of Service
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
                Welcome to SpendFlow. These Terms of Service ("Terms") govern your use of our application and services. 
                By accessing or using our services, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li><strong>"Service"</strong> refers to the SpendFlow application and related services.</li>
                <li><strong>"User"</strong> refers to anyone who accesses or uses our Service.</li>
                <li><strong>"Content"</strong> refers to all content made available through our Service.</li>
                <li><strong>"Account"</strong> refers to your registered account with SpendFlow.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">3. Account Registration</h2>
              <p className="text-slate-300">
                To use certain features of our Service, you must register for an account. You agree to provide accurate and complete information and to keep this information updated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">4. User Responsibilities</h2>
              <p className="text-slate-300">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">5. Payment Terms</h2>
              <p className="text-slate-300">
                If you purchase a subscription or make other payments through our Service:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
                <li>All fees are stated in GBP and are exclusive of applicable taxes</li>
                <li>Payment is due at the beginning of each subscription period</li>
                <li>We use secure third-party payment processors to handle all transactions</li>
                <li>We do not store or process your payment card details on our servers</li>
                <li>You will be redirected to our secure payment processor for all transactions</li>
              </ul>
              <p className="mt-4 text-slate-300">
                <strong>Important:</strong> We do not collect or store credit/debit card details or phone numbers. All payment processing is handled by secure third-party payment processors, and we only receive confirmation of transactions, not the payment details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">6. Data Handling</h2>
              <p className="text-slate-300">
                We are committed to protecting your privacy and data:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
                <li>We do not collect or store sensitive payment information</li>
                <li>We do not require or store phone numbers</li>
                <li>We do not share your personal information with third parties except as necessary to provide our services</li>
                <li>We implement appropriate security measures to protect your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">7. Third-Party Services</h2>
              <p className="text-slate-300">
                Our Service may include or link to third-party services. Please note that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-slate-300">
                <li>We use third-party payment processors to handle transactions securely</li>
                <li>These third parties have their own privacy policies and terms of service</li>
                <li>We are not responsible for the practices of these third-party services</li>
                <li>We only work with third parties that meet our security and privacy standards</li>
              </ul>
              <p className="mt-4 text-slate-300">
                We do not sell, rent, or trade your personal information to third parties for marketing or any other purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">8. Intellectual Property</h2>
              <p className="text-slate-300">
                All content included in or made available through our Service is the property of SpendFlow or its licensors and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">9. Termination</h2>
              <p className="text-slate-300">
                We may terminate or suspend your account and access to our Service immediately, without prior notice, for any reason, including without limitation if you breach these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-300">
                To the maximum extent permitted by law, SpendFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">11. Governing Law</h2>
              <p className="text-slate-300">
                These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">12. Dispute Resolution</h2>
              <p className="text-slate-300">
                Before taking any formal action, we encourage you to contact us at spendflowapp@gmail.com to attempt to resolve any dispute informally. If we cannot resolve the dispute within 30 days, both parties agree to resolve any claim through binding arbitration in the United Kingdom, in accordance with the laws of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">13. Force Majeure</h2>
              <p className="text-slate-300">
                We shall not be liable for any failure to perform our obligations where such failure results from any cause beyond our reasonable control, including, without limitation, mechanical, electronic or communications failure or degradation, governmental actions, or natural disasters.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">14. Severability</h2>
              <p className="text-slate-300">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect and enforceable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">15. Entire Agreement</h2>
              <p className="text-slate-300">
                These Terms constitute the entire agreement between you and SpendFlow regarding the Service and supersede all prior agreements and understandings, whether written or oral.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">16. Changes to Terms</h2>
              <p className="text-slate-300">
                We reserve the right to modify these Terms at any time. We will provide notice of any changes by updating the "Last updated" date at the top of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold text-slate-100 mb-4">17. Contact Us</h2>
              <p className="text-slate-300">
                If you have any questions about these Terms, please contact us at:
              </p>
              <address className="not-italic mt-2 text-slate-300">
                Email: spendflowapp@gmail.com<br />
                United Kingdom
              </address>
            </section>
        </div>
      </div>
      </div>
    </div>
  );
}
