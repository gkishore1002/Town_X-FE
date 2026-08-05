import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LEGAL_ROUTES = {
  about: "/about",
  terms: "/terms",
  privacy: "/privacy",
  faqs: "/faqs",
} as const;

export function FooterLinks({ className }: { className?: string }) {
  const linkClass =
    "hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm";

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500",
        className
      )}
      aria-label="Legal and help links"
    >
      <Link to={LEGAL_ROUTES.about} className={linkClass}>
        About Us
      </Link>
      <Link to={LEGAL_ROUTES.terms} className={linkClass}>
        Terms &amp; Conditions
      </Link>
      <Link to={LEGAL_ROUTES.privacy} className={linkClass}>
        Privacy Policy
      </Link>
      <Link to={LEGAL_ROUTES.faqs} className={linkClass}>
        FAQs
      </Link>
    </nav>
  );
}

export default FooterLinks;
