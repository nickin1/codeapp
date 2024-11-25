'use client';

import Templates from '../components/templates/Templates';
import { Suspense } from 'react';

export default function TemplatesPage() {
  return (
      <div className="container mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold my-4">Code Templates</h1>
          <p className="text-gray-600">
            Browse, search, and use code templates. Sign in to save your own templates or fork existing ones.
          </p>
          <Suspense fallback={<div>Loading templates...</div>}>
            <Templates />
          </Suspense>
        </div>
      </div>
  );
}