import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody, CardFooter, Button, Chip, Divider } from "@nextui-org/react";
import { useRouter } from 'next/navigation';


interface TemplateCardProps {
    template: {
        id: string;
        title: string;
        description?: string;
        code: string;
        language: string;
        tags: string;
        authorId: string;
        author: {
          name: string;
        };
        forked: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      onEdit?: (template: any) => void;
      onDelete?: (id: string) => void;
  }
  export default function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
    const { user } = useAuth();
    const [isForking, setIsForking] = useState(false);
    const router = useRouter();

    const handleUseTemplate = () => {
        router.push(`/editor?templateId=${template.id}`);
    };

    const handleFork = async () => {
        try {
            setIsForking(true);
            const response = await fetch(`/api/templates/${template.id}/fork`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                    newTitle: `${template.title} (Fork)`,
                }),
            });
    
          if (!response.ok) throw new Error('Failed to fork template');
          
          alert('Template forked successfully!');
        } catch (error) {
          alert('Failed to fork template');
        } finally {
          setIsForking(false);
        }
    };
    return (

        <Card className="max-w-md">
            <CardHeader className="flex flex-col items-start gap-2">
                <div className="flex justify-between w-full">
                    <h3 className="text-xl font-semibold text-gray-800">{template.title}</h3>
                    {template.forked && (
                        <Chip size="sm" variant="flat" color="default">
                            Forked
                        </Chip>
                    )}
                </div>
                <p className="text-sm text-gray-600">by {template.author.name}</p>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col gap-2">
                    {template.description && (
                        <p className="text-sm text-gray-600">{template.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Chip color="primary" variant="flat">
                            {template.language}
                        </Chip>
                        {template.tags.split(',').map((tag: string) => (
                            <Chip color="primary" variant="flat">
                                {tag}
                            </Chip>
                        ))}
                    </div>
            </CardBody>
            <Divider />
            <CardFooter className="gap2">
            <Button color="primary" variant="flat" onClick={handleUseTemplate}>
                    Use Template
                </Button>
                <Button color="primary" isLoading={isForking} onClick={handleFork}>
                    {isForking ? 'Forking...' : 'Fork'}
                </Button>
                {user?.id === template.authorId && (
                <>
                    <Button color="default" variant="flat">
                        Edit
                    </Button>

                    <Button color="danger" variant="flat" onPress={() => onDelete?.(template.id)}>
                        Delete
                    </Button>
                </>
                )}
            </CardFooter>
        </Card>
    );
}