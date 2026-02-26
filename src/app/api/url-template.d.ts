declare module 'url-template' {
  export interface UrlTemplate {
    expand(variables: Record<string, unknown>): string;
  }

  export function parseTemplate(template: string): UrlTemplate;
}
