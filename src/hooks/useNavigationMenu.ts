import { useQuery } from "@tanstack/react-query";
import { fetchNavigationMenuTree } from "@/lib/navigation/api";

export function useNavigationMenu(slug: string, options?: { locale?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ["navigation-menu", slug, options?.locale ?? "en"],
    queryFn: () => fetchNavigationMenuTree(slug, { locale: options?.locale }),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

