import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

interface Rule {
  id: string;
  name: string;
  severity: string;
  description: string;
  protocol?: string;
  file: string;
}

async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  if (!existsSync(dir)) {
    return [];
  }
  
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findFiles(fullPath, extensions));
    } else if (extensions.includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function parseRule(filePath: string): Promise<Rule | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = filePath.replace(process.cwd() + '/', '');
    
    if (filePath.endsWith('.json')) {
      const data = JSON.parse(content);
      return {
        id: data.id || data.rule_id || 'unknown',
        name: data.name || data.title || 'Unnamed Rule',
        severity: data.severity || 'medium',
        description: data.description || data.desc || '',
        protocol: data.protocol,
        file: relativePath,
      };
    } else {
      // Parse YAML (simple key-value extraction)
      const lines = content.split('\n');
      const rule: any = {};
      
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          rule[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      }
      
      return {
        id: rule.id || rule.rule_id || 'unknown',
        name: rule.name || rule.title || 'Unnamed Rule',
        severity: rule.severity || 'medium',
        description: rule.description || rule.desc || '',
        protocol: rule.protocol,
        file: relativePath,
      };
    }
  } catch (error) {
    console.error(`Error parsing rule file ${filePath}:`, error);
    return null;
  }
}

async function main() {
  const rulesDir = join(process.cwd(), '..', 'rules');
  const outputDir = join(process.cwd(), 'public', 'rulebook');
  const outputFile = join(outputDir, 'rules.json');
  
  await mkdir(outputDir, { recursive: true });
  
  const ruleFiles = await findFiles(rulesDir, ['.yml', '.yaml', '.json']);
  const rules: Rule[] = [];
  
  for (const file of ruleFiles) {
    const rule = await parseRule(file);
    if (rule) {
      rules.push(rule);
    }
  }
  
  console.log(`Found ${rules.length} rules`);
  await writeFile(outputFile, JSON.stringify(rules, null, 2));
  console.log(`Rules index written to ${outputFile}`);
}

main().catch(console.error);
