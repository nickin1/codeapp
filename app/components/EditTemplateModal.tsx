import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react";

interface EditTemplateModalProps {
    template: {
        id: string;
        title: string;
        description?: string;
        code: string;
        language: string;
        tags: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditTemplateModal({ template, isOpen, onClose, onUpdate }: EditTemplateModalProps) {
    const [title, setTitle] = useState(template.title);
    const [description, setDescription] = useState(template.description || '');
    const [code, setCode] = useState(template.code);
    const [tags, setTags] = useState(template.tags);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/templates/${template.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    code,
                    language: template.language,
                    tags
                }),
            });

            if (!response.ok) throw new Error('Failed to update template');
            
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating template:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Edit Template</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <Textarea
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Textarea
                                label="Code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                            <Input
                                label="Tags (comma-separated)"
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
                            Save Changes
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}