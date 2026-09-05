import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms on which you may use the Transformation Church website.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPage
      slug="terms-of-use"
      lede="The terms on which you may make use of our website."
    />
  );
}
