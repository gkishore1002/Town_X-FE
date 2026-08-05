import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LegalSection({
  title,
  children,
  id,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="not-first:mt-8 not-first:border-t not-first:border-gray-100 not-first:pt-8">
      <h2 className="font-display text-lg font-semibold text-gray-900 sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-brand-500">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function FaqItem({ question, answer }: { question: string; answer: ReactNode }) {
  return (
    <details className="group rounded-control border border-gray-200 bg-gray-50/50 open:bg-white open:shadow-soft-sm">
      <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-3">
          {question}
          <span className="mt-0.5 shrink-0 text-brand-500 transition-transform group-open:rotate-45">
            +
          </span>
        </span>
      </summary>
      <div className="border-t border-gray-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-600">
        {answer}
      </div>
    </details>
  );
}

export function LegalNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("rounded-control border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900", className)}>
      {children}
    </p>
  );
}
