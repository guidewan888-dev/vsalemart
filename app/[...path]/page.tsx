import { notFound } from "next/navigation";
import { StorePage } from "@/components/store/pages";
import { pages } from "@/lib/store/routes";
import type { Metadata } from "next";
type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
function valid(path: string) {
  return (
    path in pages ||
    /^\/products\/[^/]+$/.test(path) ||
    /^\/(account|admin)\/(orders|quotes|returns)\/[^/]+(\/(invoice|review))?$/.test(
      path,
    ) ||
    /^\/admin\/(payments|shipments|business|support)\/[^/]+$/.test(path)
  );
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = "/" + (await params).path.join("/");
  const t = pages[p as keyof typeof pages];
  return {
    title: t?.[0] ?? "รายละเอียด",
    robots: {
      index:
        !/^\/(admin|account|checkout|design-system|login|register|reset-password|forgot-password|quotes)/.test(
          p,
        ),
      follow: true,
    },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const p = "/" + (await params).path.join("/");
  if (!valid(p)) notFound();
  const raw = await searchParams;
  const query = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : (v ?? ""),
    ]),
  );
  return <StorePage key={p} path={p} query={query} />;
}
