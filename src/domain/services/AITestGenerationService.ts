import { IntegrationSettingsService } from './IntegrationSettingsService';

export interface CodeFile {
    path: string;
    content: string;
}

export interface GeneratedTestCase {
    title: string;
    steps: string;
    expectedResult: string;
    priority: 'P1' | 'P2' | 'P3' | 'P4';
}

export interface GeneratedModule {
    moduleName: string;
    testCases: GeneratedTestCase[];
}

export class AITestGenerationService {
    constructor(private aiSettingsService: IntegrationSettingsService) { }

    async generateTestPlan(files: CodeFile[], contextPrompt?: string): Promise<GeneratedModule[]> {
        const provider = await this.aiSettingsService.getLLMProvider();

        const systemPrompt = `You are an expert QA Engineer. 
Your task is to analyze the provided source code files and generate a comprehensive Test Plan.
Group the test cases logically into modules based on the code's distinct features or files.
Output strictly in valid JSON format matching this schema:
[
  {
    "moduleName": "string",
    "testCases": [
      {
        "title": "string",
        "steps": "string (multiline allowed, number them)",
        "expectedResult": "string",
        "priority": "P1" | "P2" | "P3" | "P4"
      }
    ]
  }
]
Do not output any markdown formatting like \`\`\`json around the JSON, just the raw JSON array. Answer ONLY with the raw JSON.`;

        const userPrompt = `Context/Requirements: ${contextPrompt || 'None'}
    
Source Code Files:
${files.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join('\n')}

Generate the test plan JSON now.`;

        const response = await provider.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], {
            temperature: 0.2,
            responseFormat: 'json',
            maxTokens: 4000
        });

        try {
            // Remove any trailing/leading markdown or formatting if the LLM hallucinated it
            let text = response.content.trim();
            if (text.startsWith('```json')) text = text.substring(7);
            if (text.startsWith('```')) text = text.substring(3);
            if (text.endsWith('```')) text = text.substring(0, text.length - 3);
            text = text.trim();

            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse LLM JSON response:', response.content);
            throw new Error('LLM returned invalid JSON format. Please try again or check provider settings.');
        }
    }
}
