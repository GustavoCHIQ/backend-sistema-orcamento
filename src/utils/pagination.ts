export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query: PaginationQuery): Pagination {
  const page = Math.max(parseInt(query.page || '1', 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(total: number, { page, limit }: Pagination) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export function buildSearchFilter(search: string | undefined, fields: string[]): Record<string, unknown> | undefined {
  if (!search || !search.trim()) return undefined;

  return {
    OR: fields.map((field) => ({
      [field]: { contains: search.trim(), mode: 'insensitive' as const },
    })),
  };
}
