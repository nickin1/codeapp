import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TemplateCard from './TemplateCard';
import { useDebounce } from '@/app/hooks/useDebounce';
import SearchBar from '../SearchBar';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Template {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string;
  authorId: string;
  author?: {
    name: string;
  };

  forked: boolean;
  createdAt: Date;
  updatedAt: Date;
  blogPosts: Array<{
    id: string;
    title: string;
  }>;
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
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const userIdParam = showOwnedOnly && user ? `&userId=${user.id}` : '';
      const endpoint = `/api/templates/search?searchTerm=${encodeURIComponent(debouncedSearchTerm)}&page=${currentPage}&limit=10${userIdParam}${showOwnedOnly ? '&ownedOnly=true' : ''}`;

      const response = await fetch(endpoint);

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
    setTemplateToDelete(templateId);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/templates/${templateToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      setTemplates(templates.filter(template => template.id !== templateToDelete));
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => setCurrentPage(i)}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        {pageNumbers}
        <Button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-72">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search templates..."
          />
        </div>
        {user && (
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <Checkbox
              id="ownedOnly"
              checked={showOwnedOnly}
              onCheckedChange={(checked) => setShowOwnedOnly(checked as boolean)}
            />
            <Label htmlFor="ownedOnly" className="text-sm text-muted-foreground">
              My templates
            </Label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[240px] rounded-lg" />
          ))}
        </div>
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
            <div className="text-center py-8 text-muted-foreground">
              No templates found. {!userOnly && "Try adjusting your search."}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}