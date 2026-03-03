'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ImportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('Importing...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage('Success!');
        router.refresh();
      } else {
        setMessage('Failed to import.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error uploading.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="flex items-center gap-2">
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
      <input
        type="file"
        id="import-file"
        accept=".md,.html"
        className="hidden"
        onChange={handleUpload}
        disabled={loading}
      />
      <label
        htmlFor="import-file"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
      >
        <UploadCloud className="h-4 w-4" />
        {loading ? 'Importing...' : 'Import Test Plan'}
      </label>
    </div>
  );
}
