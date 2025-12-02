import { Suspense } from 'react';
import ContentPageClient from './ContentPageClient';

export default function ContentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 mt-4">Loading Content OS...</p>
        </div>
      </div>
    }>
      <ContentPageClient />
    </Suspense>
  );
}
