export interface Language {
    id: string;
    name: string;
    extension: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
    { id: 'typescript', name: 'TypeScript', extension: 'ts' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'c', name: 'C', extension: 'c' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'rust', name: 'Rust', extension: 'rs' },
    { id: 'go', name: 'Go', extension: 'go' },
    { id: 'racket', name: 'Racket', extension: 'rkt' },
    { id: 'ruby', name: 'Ruby', extension: 'rb' }
];

export const getLanguageById = (id: string): Language | undefined => {
    return SUPPORTED_LANGUAGES.find(lang => lang.id === id);
}; 