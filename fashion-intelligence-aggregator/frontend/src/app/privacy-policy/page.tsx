import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-[var(--bg)]">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2.5 mb-10 group text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
            <span className="text-white text-sm font-bold">FI</span>
          </div>
          <span className="font-headline font-semibold">Fashion Intelligence</span>
        </Link>

        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">
          Last updated: February 7, 2026
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              1. Acceptance
            </h2>
            <p>
              By accessing or using the Fashion Intelligence service (“Service”), you agree to this Privacy Policy and our Terms of Service. If you do not agree, do not use the Service. We reserve the right to modify this policy at any time; your continued use after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              2. Information We Collect
            </h2>
            <p>
              We may collect information you provide (e.g., account credentials, profile data, display name, username, images you upload), information from your use of the Service (e.g., usage data, preferences, chat content, product interactions), and technical and device information (e.g., IP address, browser type, identifiers). We may also receive or infer information from third-party sign-in providers (e.g., Google) and from cookies and similar technologies. We do not guarantee the accuracy or completeness of any data we store or process.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              3. How We Use Information
            </h2>
            <p>
              We use collected information to operate, improve, and personalize the Service; to provide support; to comply with law; and for other purposes described in this policy or as permitted by law. We may use aggregated or de-identified data for analytics, research, or product development without restriction. We do not warrant that our use of your information will achieve any particular result or be free from errors.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              4. Third-Party Services
            </h2>
            <p>
              The Service may integrate or link to third-party services (e.g., Google for sign-in, Pinterest, external merchants, AI or data providers). Those services have their own privacy practices. We are not responsible for the privacy, security, or content of any third party. Your use of third-party features is at your own risk, and we disclaim all liability arising from third-party conduct or policies.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              5. Cookies and Tracking
            </h2>
            <p>
              We and our partners may use cookies, local storage, and similar technologies for authentication, preferences, analytics, and security. You may be able to limit some tracking via browser settings, but doing so may affect Service functionality. We do not guarantee that our use of these technologies will be error-free or that your preferences will be honored in all contexts.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              6. Data Retention and Security
            </h2>
            <p>
              We retain your information for as long as we deem necessary to operate the Service, comply with law, or enforce our rights. We may delete or anonymize data at any time without notice. We implement reasonable technical and organizational measures to protect data, but we do not guarantee that our systems are secure or that your data will not be accessed, disclosed, altered, or lost. You use the Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              7. Your Choices
            </h2>
            <p>
              You may update account or profile information through the Service where available. You may request access, correction, or deletion of personal data by contacting us; we will process requests in accordance with applicable law but do not guarantee any particular outcome. Opting out of certain features or ceasing use may not result in immediate deletion of all data. We are not obligated to retain or provide data beyond what is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              8. Children
            </h2>
            <p>
              The Service is not intended for users under 13 (or higher age where required). We do not knowingly collect personal information from children. If you believe we have collected such information, contact us and we will take steps to delete it as required by law. We are not liable for any collection that occurs without our knowledge.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              9. International Use
            </h2>
            <p>
              The Service may be operated from and data may be processed in jurisdictions outside your residence. By using the Service, you consent to the transfer, storage, and processing of your information in such jurisdictions, which may have different data protection laws. We do not warrant compliance with the laws of any specific country other than those we expressly commit to.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              10. Disclaimer of Warranties
            </h2>
            <p>
              THE SERVICE AND ALL CONTENT, FEATURES, AND DATA ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              11. Limitation of Liability
            </h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, FASHION INTELLIGENCE, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, ANY PRIVACY PRACTICES, DATA BREACHES, THIRD-PARTY CONDUCT, OR THIS PRIVACY POLICY. IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS ($100) OR THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN SUCH CASES, OUR LIABILITY WILL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              12. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Fashion Intelligence and its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to your use of the Service, your violation of this Privacy Policy or any law, or your violation of any third-party rights. We reserve the right to assume exclusive defense and control of any matter subject to indemnification by you.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              13. Changes
            </h2>
            <p>
              We may update this Privacy Policy at any time. We will post the revised policy on this page and update the “Last updated” date. We may also provide notice by email or through the Service where appropriate. Your continued use of the Service after the effective date of changes constitutes your acceptance of the revised policy. We are not obligated to notify you of every change or to obtain your consent except where required by law.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              14. Contact
            </h2>
            <p>
              For questions about this Privacy Policy or our practices, contact us at the email or address provided on our website or in the Service. We do not guarantee a specific response time or outcome. Nothing in this policy creates any contractual or legal obligation beyond what is expressly stated.
            </p>
          </section>
        </div>

        <p className="mt-12 text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Fashion Intelligence. All rights reserved.
        </p>

        <Link
          href="/landing"
          className="inline-block mt-6 text-sm font-medium text-accent hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
