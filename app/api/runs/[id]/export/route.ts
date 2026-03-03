import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const run = await prisma.testRun.findUnique({
    where: { id },
    include: {
      testResults: {
        include: {
          testCase: {
            include: { module: true }
          }
        }
      }
    }
  });

  if (!run) {
    return new Response('Not Found', { status: 404 });
  }

  const stats = {
    PASSED: run.testResults.filter(r => r.status === 'PASSED').length,
    FAILED: run.testResults.filter(r => r.status === 'FAILED').length,
    BLOCKED: run.testResults.filter(r => r.status === 'BLOCKED').length,
    UNTESTED: run.testResults.filter(r => r.status === 'UNTESTED').length,
    total: run.testResults.length
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Report: ${run.name}</title>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #333; }
        h1 { color: #111; }
        .stats { display: flex; gap: 20px; margin-bottom: 40px; }
        .stat { padding: 10px 20px; border-radius: 8px; font-weight: bold; }
        .passed { background: #dcfce7; color: #166534; }
        .failed { background: #fee2e2; color: #991b1b; }
        .blocked { background: #ffedd5; color: #9a3412; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
        th { background: #f9fafb; }
        .status-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Test Report: ${run.name}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      
      <div class="stats">
        <div class="stat passed">Passed: ${stats.PASSED}</div>
        <div class="stat failed">Failed: ${stats.FAILED}</div>
        <div class="stat blocked">Blocked: ${stats.BLOCKED}</div>
        <div class="stat">Total: ${stats.total}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Module</th>
            <th>Title</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${run.testResults.map(r => `
            <tr>
              <td>${r.testCase.testId}</td>
              <td>${r.testCase.module.name}</td>
              <td>${r.testCase.title}</td>
              <td><span class="status-tag ${r.status.toLowerCase()}">${r.status}</span></td>
              <td>${r.notes || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="report-${run.name.replace(/\s+/g, '-')}.html"`
    }
  });
}
