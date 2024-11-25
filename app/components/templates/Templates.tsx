import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Input } from "@nextui-org/react";
import TemplateCard from './TemplateCard';

interface Template {
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
}

export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTemplates();
  }, [user, searchTerm, currentPage]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        `/api/templates/search?userId=${user?.id}&searchTerm=${searchTerm}&page=${currentPage}`
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTemplates(templates.filter(template => template.id !== templateId));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <Input
        type="search"
        placeholder="Search templates..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard 
            key={template.id} 
            template={template}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}