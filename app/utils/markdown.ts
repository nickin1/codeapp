export function extractTemplateIds(content: string): string[] {

    if (!content) {
        console.warn('Content is empty');
        console.groupEnd();
        return [];
    }

    const templateLinkRegex = /\[([^\]]+)\]\((?:https?:\/\/[^\/]+)?\/editor\?templateId=([a-zA-Z0-9_-]+)\)/g;
    const templateIds: string[] = [];
    let match;

    try {
        const matches = content.match(templateLinkRegex);

        while ((match = templateLinkRegex.exec(content)) !== null) {
            templateIds.push(match[2]);
        }
    } catch (error) {
        console.error('Error in template extraction:', error);
    }

    console.groupEnd();
    return [...new Set(templateIds)];
} 