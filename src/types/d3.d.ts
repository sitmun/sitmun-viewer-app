/**
 * Type declarations for d3 v3.5.17
 * Required for c3 charts used by SITNA elevation profiles
 */
declare module 'd3' {
  interface D3Scale {
    category10(): (n: number) => string;
    [key: string]: any;
  }

  interface D3 {
    scale: D3Scale;
    [key: string]: any;
  }

  const d3: D3;
  export default d3;
}
