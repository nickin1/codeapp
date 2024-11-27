export function extractTemplateIds(content: string): string[] {
    // Match pattern: [template:id] where id is the template ID
    const templatePattern = /\[template:([a-zA-Z0-9-]+)\]/g;
    const matches = [...content.matchAll(templatePattern)];
    return matches.map(match => match[1]);
} 