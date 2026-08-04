import TownLoader from "@/components/shared/TownLoader";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return <TownLoader size="lg" label={label} minHeight="50vh" />;
}

export default PageLoader;
