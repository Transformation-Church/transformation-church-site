import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Transformation Church collects, uses and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      slug="privacy-policy"
      lede="How we collect, use and protect your personal data."
    />
  );
}
