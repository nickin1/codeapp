import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TemplateCard from './TemplateCard';
import { useDebounce } from '@/app/hooks/useDebounce';
import SearchBar from '../SearchBar';

interface Template {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string;
  authorId: string;
  author?: {
    firstName: string;
    lastName: string;
  };
  forked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplatesProps {
  userOnly?: boolean;
}

export default function Templates({ userOnly = false }: TemplatesProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const userIdParam = showOwnedOnly && user ? `&userId=${user.id}` : '';
      const endpoint = `/api/templates/search?searchTerm=${encodeURIComponent(debouncedSearchTerm)}&page=${currentPage}&limit=10${userIdParam}${showOwnedOnly ? '&ownedOnly=true' : ''}`;
      console.log('Fetching templates with endpoint:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          ...(showOwnedOnly && user && {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user, debouncedSearchTerm, currentPage, userOnly, showOwnedOnly]);

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      setTemplates(templates.filter(template => template.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on new search
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${currentPage === i
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        {pageNumbers}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="max-w-md mx-auto">
        <SearchBar onSearch={handleSearch} />
        {user && (
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id="ownedOnly"
              checked={showOwnedOnly}
              onChange={(e) => setShowOwnedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ownedOnly" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Show only my templates
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onDelete={handleDelete}
                onUpdate={fetchTemplates}
              />
            ))}
          </div>

          {totalPages > 1 && renderPagination()}

          {templates.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No templates found. {!userOnly && "Try adjusting your search."}
            </div>
          )}
        </>
      )}
    </div>
  );
}