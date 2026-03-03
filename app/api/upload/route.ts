import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    await parseAndSaveMarkdown(text);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return NextResponse.json({ error: 'Failed to parse markdown' }, { status: 500 });
  }
}

async function parseAndSaveMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  let currentModule: any = null;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for Module Header
    // e.g., "## 3. Модуль: Онбординг"
    const moduleMatch = line.match(/^##\s+(?:\d+\.)?\s*(?:Модуль:)?\s*(.+)$/i);
    if (moduleMatch) {
      const moduleName = moduleMatch[1].trim();
      
      // Check if module already exists
      currentModule = await prisma.module.findFirst({
        where: { name: moduleName }
      });
      
      if (!currentModule) {
        currentModule = await prisma.module.create({
          data: { name: moduleName },
        });
      }
      
      inTable = false;
      continue;
    }

    // Check for Table Header
    if (line.startsWith('| ID |') || line.startsWith('|ID|') || line.startsWith('| ID') || line.includes('| Название |')) {
      inTable = true;
      // Skip the separator line
      if (i + 1 < lines.length && lines[i + 1].includes('|---|')) {
        i++;
      }
      continue;
    }

    // Parse Table Row
    if (inTable && line.startsWith('|') && currentModule) {
      const parts = line.split('|').map((p) => p.trim());
      // parts: ["", "ID", "Название", "Шаги", "Ожидаемый результат", "Приоритет", ""]
      if (parts.length >= 6) {
        const testId = parts[1];
        const title = parts[2];
        const steps = parts[3];
        const expectedResult = parts[4];
        const priority = parts[5];

        if (testId && testId !== 'ID' && !testId.includes('---')) {
          // Check if test case already exists
          const existingTest = await prisma.testCase.findFirst({
            where: { testId, moduleId: currentModule.id }
          });
          
          if (!existingTest) {
            await prisma.testCase.create({
              data: {
                testId,
                title,
                steps,
                expectedResult,
                priority,
                moduleId: currentModule.id,
              },
            });
          }
        }
      }
    } else if (inTable && !line.startsWith('|') && line !== '') {
      // End of table
      inTable = false;
    }
  }
}
