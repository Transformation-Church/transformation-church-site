import type { Metadata } from "next";

import { canonical } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Transformation Church collects, uses and protects your personal data.",
  ...canonical("/privacy-policy"),
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      slug="privacy-policy"
      lede="How we collect, use and protect your personal data."
    />
  );
}
