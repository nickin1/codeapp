export function extractTemplateIds(content: string): string[] {
    // Client-side logging
    console.group('Template ID Extraction');
    console.log('Input content:', content);

    if (!content) {
        console.warn('Content is empty');
        console.groupEnd();
        return [];
    }

    const templateLinkRegex = /\[([^\]]+)\]\((?:https?:\/\/[^\/]+)?\/editor\?templateId=([a-zA-Z0-9_-]+)\)/g;
    const templateIds: string[] = [];
    let match;

    try {
        // Test the regex against the content
        console.log('Applying regex:', templateLinkRegex.source);
        const matches = content.match(templateLinkRegex);
        console.log('Raw matches:', matches);

        while ((match = templateLinkRegex.exec(content)) !== null) {
            console.log('Match found:', {
                fullMatch: match[0],
                linkText: match[1],
                templateId: match[2]
            });
            templateIds.push(match[2]);
        }
    } catch (error) {
        console.error('Error in template extraction:', error);
    }

    console.log('Final template IDs:', templateIds);
    console.groupEnd();
    return [...new Set(templateIds)];
} 