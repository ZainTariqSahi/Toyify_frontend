"use client";
import { useState } from "react";

export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-purple-600 text-sm font-medium mb-2">
          Current as of 20 Dec 2025
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Terms of service & Privacy policy
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your privacy is important to us at Untitled. We respect your privacy
          regarding any information we may collect from you across our website.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "terms"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Terms of service
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "privacy"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Privacy policy
        </button>
      </div>

      {/* Content */}
      <div className="bg-white">
        {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-8 text-sm">
      <p className="text-gray-600">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Alpha Testing Notice */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="font-semibold text-gray-900">Alpha Testing Notice</p>
        <p className="text-gray-600 mt-1">
          BuzzyMuzzy is currently in alpha testing phase. Our service, pricing,
          and terms may change as we develop and improve the platform.
        </p>
      </div>

      {/* 1 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          1. Service Description
        </h3>
        <p className="text-gray-600">
          BuzzyMuzzy provides a custom toy creation service where customers
          upload drawings that we transform into 3D-printed physical toys. By
          using our service, you agree to these terms.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          2. User Responsibilities
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>Provide accurate contact and delivery information</li>
          <li>Own or have rights to use the drawings you submit</li>
          <li>
            Ensure drawings do not contain offensive, illegal, or inappropriate
            content
          </li>
        </ul>
      </section>

      {/* 3 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          3. Intellectual Property Rights
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>
            <strong>Your Drawing:</strong> You retain ownership of the original
            drawing you submit
          </li>
          <li>
            <strong>3D Model & Physical Toy:</strong> BuzzyMuzzy owns all rights
            to the 3D model we create and the physical printed toy
          </li>
          <li>
            <strong>Marketing Usage:</strong> By submitting your drawing, you
            grant BuzzyMuzzy permission to use it in our advertisements,
            marketing materials, and promotional content
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          4. Pricing & Payment
        </h3>
        <p className="text-gray-600 mb-2">
          <strong>Upfront Payment:</strong> All orders must be paid in full
          before production begins via Stripe payment processing.
        </p>
        <p className="text-gray-600">
          Prices are displayed before checkout and include the toy creation
          cost. Shipping costs are additional and calculated based on delivery
          location and quantity.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          5. Production & Timeline
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>
            <strong>Typical Production Time:</strong> 3 days from order
            confirmation
          </li>
          <li>
            <strong>Shipping:</strong> Delivery time depends on your location
          </li>
          <li>
            <strong>No Guarantee:</strong> We do not guarantee specific delivery
            dates
          </li>
        </ul>
      </section>

      {/* 6 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          6. Design Modifications
        </h3>
        <p className="text-gray-600">
          BuzzyMuzzy reserves the right to modify your drawing design during the
          3D modeling process to ensure:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>Structural durability and stability</li>
          <li>Aesthetic quality and printability</li>
          <li>Safety standards compliance</li>
        </ul>
      </section>

      {/* 7 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          7. No Exact Match Guarantee
        </h3>
        <p className="text-gray-600">
          The final physical toy may not exactly match your original drawing. We
          strive for the best representation possible while maintaining quality
          and safety.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          8. Refund Policy
        </h3>
        <p className="text-gray-600 font-semibold">Customer Satisfaction:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2 mb-2">
          <li>You may request a refund within 30 days if not satisfied</li>
        </ul>
        <p className="text-gray-600 font-semibold">Shipping Damage:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>We do not guarantee refunds for shipping damage</li>
          <li>Replacements are at BuzzyMuzzy's discretion</li>
          <li>Contact us immediately if the product arrives damaged</li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          9. Shipping
        </h3>
        <p className="text-gray-600">
          Customers are responsible for shipping costs unless promotions apply.
        </p>
      </section>

      {/* 10 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          10. Limitation of Liability
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
          <li>Damage during shipping beyond our control</li>
          <li>Minor variations between drawing and final toy</li>
          <li>Delays in production or delivery</li>
        </ul>
      </section>

      {/* 11 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          11. Governing Law
        </h3>
        <p className="text-gray-600">
          These terms are governed by UK law and disputes will be handled in
          courts located in London, UK.
        </p>
      </section>

      {/* 12 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          12. Contact Information
        </h3>
        <p className="text-gray-600">
          Email: support@buzzymuzzy.com <br />
          Location: London, United Kingdom
        </p>
      </section>

      {/* 13 */}
      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          13. Changes to Terms
        </h3>
        <p className="text-gray-600">
          We may update these terms at any time. Continued use of our service
          means you accept the updated terms.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8 text-sm">
      <p className="text-gray-600">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="font-semibold text-gray-900">Alpha Testing Notice</p>
        <p className="text-gray-600 mt-1">
          BuzzyMuzzy is currently in alpha testing phase. This privacy policy
          may be updated as our service evolves.
        </p>
      </div>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          1. Company Information
        </h3>
        <p className="text-gray-600">
          BuzzyMuzzy (unregistered, alpha testing phase)
          <br />
          Based in London, United Kingdom
          <br />
          Email: support@buzzymuzzy.com
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          2. Data We Collect
        </h3>
        <p className="text-gray-600 mb-2">
          We only collect the following information necessary to fulfill your
          custom toy order:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
          <li>Your name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Delivery address</li>
          <li>Drawing uploads (images you submit for toy creation)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          3. How We Use Your Data
        </h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
          <li>
            <strong>Order Fulfillment:</strong> To create and deliver your
            custom toy
          </li>
          <li>
            <strong>Customer Communication:</strong> To update you about your
            order status
          </li>
          <li>
            <strong>Marketing:</strong> Your submitted drawings may be used in
            our advertisements and marketing materials
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          4. Cookies
        </h3>
        <p className="text-gray-600">
          BuzzyMuzzy does not use cookies directly. However, the Lovable
          platform hosting our service may use analytics cookies to improve
          performance.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          5. Data Storage & Security
        </h3>
        <p className="text-gray-600">
          Your data is securely stored using Lovable Cloud/Supabase
          infrastructure. We implement industry-standard security measures to
          protect your information.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          6. Third-Party Services
        </h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
          <li>
            <strong>Stripe:</strong> For secure payment processing
          </li>
          <li>
            <strong>Resend:</strong> For sending order confirmation and update
            emails
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          7. Your Rights (UK GDPR & EU Compliance)
        </h3>
        <p className="text-gray-600 mb-2">You have the right to:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Request data portability</li>
        </ul>
        <p className="text-gray-600 mt-2">
          To exercise these rights, contact us at support@buzzymuzzy.com
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          8. Data Retention
        </h3>
        <p className="text-gray-600">
          We retain your order data and drawings for as long as necessary to
          fulfill orders, handle refunds (up to 30 days), and maintain business
          records. You may request deletion at any time by contacting
          support@buzzymuzzy.com
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-2 text-base">
          9. Contact Us
        </h3>
        <p className="text-gray-600">
          For any privacy-related questions or concerns, please contact us:
          <br />
          Email: support@buzzymuzzy.com
        </p>
      </section>
    </div>
  );
}