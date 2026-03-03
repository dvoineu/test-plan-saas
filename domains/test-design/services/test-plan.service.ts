import { ModuleRepository } from '../repositories/module.repository';
import { TestCaseRepository } from '../repositories/test-case.repository';

export class TestPlanService {
  private moduleRepo = new ModuleRepository();
  private testCaseRepo = new TestCaseRepository();

  async parseAndSaveMarkdown(markdown: string) {
    const lines = markdown.split('\n');
    let currentModule: any = null;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for Module Header
      const moduleMatch = line.match(/^##\s+(?:\d+\.)?\s*(?:Модуль:)?\s*(.+)$/i);
      if (moduleMatch) {
        const moduleName = moduleMatch[1].trim();
        
        currentModule = await this.moduleRepo.findByName(moduleName);
        
        if (!currentModule) {
          currentModule = await this.moduleRepo.create(moduleName);
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
        if (parts.length >= 6) {
          const testId = parts[1];
          const title = parts[2];
          const steps = parts[3];
          const expectedResult = parts[4];
          const priority = parts[5];

          if (testId && testId !== 'ID' && !testId.includes('---')) {
            const existingTest = await this.testCaseRepo.findByTestId(testId);
            
            if (!existingTest || existingTest.moduleId !== currentModule.id) {
              await this.testCaseRepo.create({
                testId,
                title,
                steps,
                expectedResult,
                priority,
                moduleId: currentModule.id,
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
}
