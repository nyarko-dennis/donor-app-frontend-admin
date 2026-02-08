export type QueryParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export function serializeQueryParams(params: QueryParams): string {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .filter((v): v is Exclude<QueryParamValue, undefined | null> => v !== undefined && v !== null)
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
      } else if (value !== undefined && value !== null) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      }
      return [];
    })
    .join("&");
}