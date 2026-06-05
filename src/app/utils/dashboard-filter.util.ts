import { DashboardItem } from '@api/services/common.service';

/** Client-side dashboard filter (backend list endpoint has no keyword param). */
export function filterDashboardItemsByKeyword(
  items: DashboardItem[],
  keyword: string
): DashboardItem[] {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return [...items];
  }
  return items.filter((item) => {
    const title = (item.title || item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    return title.includes(normalized) || description.includes(normalized);
  });
}

/** Escapes user input for safe use inside RegExp. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
