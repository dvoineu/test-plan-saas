'use client';

import { useState } from 'react';
import { Trash2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const clearData = async () => {
    setLoading(true);
    setMessage('Clearing...');
    try {
      const res = await fetch('/api/settings/clear', { method: 'POST' });
      if (res.ok) {
        setMessage('All data cleared.');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        setMessage('Failed to clear data.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to clear data.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Appearance</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Toggle between light and dark mode</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 space-y-4">
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium">Clear All Data</span>
              <p className="text-xs text-muted-foreground">Delete all modules, test cases, and test runs from the local database.</p>
              {message && <p className="text-sm font-medium text-destructive mt-2">{message}</p>}
            </div>
            <button
              onClick={clearData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {loading ? 'Clearing...' : 'Clear Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
