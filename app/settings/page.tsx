'use client';

import React, { useState } from 'react';
import { Trash2, Moon, Sun, Save, Bot, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // AI Settings State
  const [provider, setProvider] = useState('ollama');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Integration Settings State
  const [jiraUrl, setJiraUrl] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [jiraProject, setJiraProject] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: 'success' });
  const router = useRouter();

  // Load All Settings
  React.useEffect(() => {
    fetch('/api/settings/integrations')
      .then(res => res.json())
      .then(data => {
        // AI
        if (data.llm_provider) setProvider(data.llm_provider);
        if (data.llm_model) setModel(data.llm_model);
        if (data.llm_base_url) setBaseUrl(data.llm_base_url);
        if (data.llm_api_key) setApiKey(data.llm_api_key);

        // Integrations
        if (data.jira_url) setJiraUrl(data.jira_url);
        if (data.jira_email) setJiraEmail(data.jira_email);
        if (data.jira_token) setJiraToken(data.jira_token);
        if (data.jira_project) setJiraProject(data.jira_project);
        if (data.slack_webhook) setSlackWebhook(data.slack_webhook);

        setSettingsLoading(false);
      })
      .catch(console.error);
  }, []);

  const saveSettings = async () => {
    setSettingsLoading(true);
    setSaveMessage({ text: 'Saving...', type: 'success' });
    try {
      const res = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider, model, baseUrl, apiKey,
          jiraUrl, jiraEmail, jiraToken, jiraProject,
          slackWebhook
        })
      });
      if (res.ok) {
        setSaveMessage({ text: 'Settings saved successfully!', type: 'success' });
      } else {
        setSaveMessage({ text: 'Failed to save settings.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setSaveMessage({ text: 'Error saving settings.', type: 'error' });
    } finally {
      setSettingsLoading(false);
      setTimeout(() => setSaveMessage({ text: '', type: 'success' }), 4000);
    }
  };

  const clearData = async () => {
    if (!confirm('Are you sure you want to delete ALL test plans and runs? This action is irreversible.')) return;
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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <button
          onClick={saveSettings}
          disabled={settingsLoading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
        >
          <Save className="h-4 w-4" />
          {settingsLoading ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {saveMessage.text && (
        <div className={`p-3 rounded-md text-sm font-medium flex items-center gap-2 ${saveMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          <AlertCircle className="h-4 w-4" />
          {saveMessage.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        {/* --- LEFT COLUMN --- */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2">Appearance</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Toggle between light and dark mode</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-orange-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <Bot className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">AI Configuration (LLM)</h3>
            </div>

            {settingsLoading && !provider ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading AI settings...</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                  >
                    <option value="ollama">Ollama (Local / Free)</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={provider === 'ollama' ? 'llama3, phi3, mistral' : 'gemini-1.5-flash'}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                  />
                </div>

                {provider === 'ollama' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ollama Base URL</label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                )}

                {provider === 'gemini' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gemini API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Integrations</h3>
            </div>

            {settingsLoading && !jiraUrl && !slackWebhook ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading Integration settings...</div>
            ) : (
              <div className="space-y-6">

                {/* Jira Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Jira Cloud</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workspace URL</label>
                    <input
                      type="text"
                      value={jiraUrl}
                      onChange={(e) => setJiraUrl(e.target.value)}
                      placeholder="https://your-domain.atlassian.net"
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={jiraEmail}
                        onChange={(e) => setJiraEmail(e.target.value)}
                        placeholder="user@domain.com"
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Project Key</label>
                      <input
                        type="text"
                        value={jiraProject}
                        onChange={(e) => setJiraProject(e.target.value)}
                        placeholder="e.g. QA, CORE"
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Token</label>
                    <input
                      type="password"
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      placeholder="Jira API Token..."
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Used to create tickets automatically from AI bug reports.</p>
                  </div>
                </div>

                <hr className="border-t border-border" />

                {/* Slack Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Slack Notifications</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Incoming Webhook URL</label>
                    <input
                      type="text"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">Used to broadcast test run summary statistics upon completion.</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-destructive/50 bg-destructive/5 p-6 space-y-4 max-w-2xl mx-auto shadow-sm">
        <h3 className="font-semibold text-destructive flex items-center gap-2">
          <Trash2 className="h-5 w-5" /> Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium">Clear Database</span>
            <p className="text-xs text-muted-foreground">Wipes all modules, tests, runs, and attachments. Settings are preserved.</p>
            {message && <p className="text-sm font-medium text-destructive mt-2">{message}</p>}
          </div>
          <button
            onClick={clearData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear Data'}
          </button>
        </div>
      </div>

    </div>
  );
}
