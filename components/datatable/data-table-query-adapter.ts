// A small utility to adapt various React Query results to the shape expected by DataTableClient
// This allows us to standardize how tables consume data across the app.
// Suppress eslint errors for now, as we'll revisit this later.'
/* eslint-disable @typescript-eslint/no-explicit-any */


export type GenericQueryResult<TRaw> = {
  data?: TRaw;
  isLoading: boolean;
  isFetching: boolean;
  error?: unknown;
  refetch: (...args: any[]) => any;
};

export type DataTableClientQueryResult<TItem> = {
  data: TItem[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: (...args: any[]) => any;
};

export type AdaptOptions<TItem, TRaw = any> = {
  // How to extract the array of items from the raw query data
  extract?: (raw: TRaw | undefined) => TItem[] | undefined;
  // Optional transform for the items (e.g., mapping/normalizing before table render)
  transform?: (items: TItem[]) => TItem[];
};

// Default extractor supports either an array or a paginated object with `content`
function defaultExtract<TItem>(raw: any): TItem[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw as TItem[];
  if (typeof raw === 'object' && 'content' in raw) {
    return (raw as { content?: TItem[] }).content;
  }
  return undefined;
}

export function adaptPaginatedQuery<TItem, TRaw = any>(
  query: GenericQueryResult<TRaw>,
  options?: AdaptOptions<TItem, TRaw>
): DataTableClientQueryResult<TItem> {
  const extract = options?.extract ?? (defaultExtract as AdaptOptions<TItem, TRaw>['extract']);
  const rawData = query.data as unknown as TRaw | undefined;
  const items = extract ? extract(rawData) : (rawData as unknown as TItem[] | undefined);
  const transformed = items && options?.transform ? options.transform(items) : items;

  return {
    data: transformed,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: (query.error as Error) ?? null,
    refetch: query.refetch,
  };
}
