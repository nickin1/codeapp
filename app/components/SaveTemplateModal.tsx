import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react";

interface SaveTemplateModalProps {
    code: string;
    language: string;
    onClose: () => void;
    onSave: (data: { title: string, description: string, tags: string }) => Promise<void>;
    templateId?: string;
}

export default function SaveTemplateModal({ code, language, onClose, onSave,templateId }: SaveTemplateModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            alert('You must be logged in to save templates');
            return;
        }

        setIsLoading(true);
        
        try {
            await onSave({ title, description, tags });
            
            const endpoint = templateId 
                ? `/api/templates/${templateId}/fork`
                : '/api/templates';

            const body = templateId ? {
                userId: user.id,
                newTitle: title,
                newDescription: description,
                newCode: code,
                newLanguage: language,
                newTags: tags
            } : {
                title,
                description,
                code,
                language,
                tags,
                authorId: user.id
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Failed to save template');
            
            alert(templateId ? 'Template forked successfully!' : 'Template saved successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        {templateId ? 'Fork Template' : 'Save as Template'}
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Title"
                                placeholder="Enter template title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <Textarea
                                label="Description"
                                placeholder="Enter template description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Input
                                label="Tags"
                                placeholder="Enter comma-separated tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button color="primary" type="submit" isLoading={isLoading}>
                            {templateId ? 'Fork Template' : 'Save Template'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}