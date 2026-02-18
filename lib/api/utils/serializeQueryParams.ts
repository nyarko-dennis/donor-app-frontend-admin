export type QueryParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export function serializeQueryParams(params: QueryParams): string {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        const filteredValues = value.filter((v): v is Exclude<QueryParamValue, undefined | null> => v !== undefined && v !== null);
        if (filteredValues.length > 0) {
          // Join with literal comma, as requested
          return `${encodeURIComponent(key)}=${filteredValues.map(v => encodeURIComponent(String(v))).join(",")}`;
        }
        return [];
      } else if (value !== undefined && value !== null) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      }
      return [];
    })
    .join("&");
}