import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

interface Signature {
  id: string;
  name: string;
  protocol: string;
  description: string;
  fields?: string[];
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

async function parseSignature(filePath: string): Promise<Signature | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = filePath.replace(process.cwd() + '/', '');
    
    if (filePath.endsWith('.json')) {
      const data = JSON.parse(content);
      return {
        id: data.id || data.signature_id || 'unknown',
        name: data.name || data.title || 'Unnamed Signature',
        protocol: data.protocol || 'Unknown',
        description: data.description || data.desc || '',
        fields: data.fields || data.match_fields || [],
        file: relativePath,
      };
    } else {
      // Parse YAML (simple key-value extraction)
      const lines = content.split('\n');
      const sig: any = {};
      const fields: string[] = [];
      
      let inFieldsSection = false;
      for (const line of lines) {
        if (line.match(/^fields:/)) {
          inFieldsSection = true;
          continue;
        }
        
        if (inFieldsSection && line.match(/^\s+-\s+(.+)$/)) {
          fields.push(line.match(/^\s+-\s+(.+)$/)![1].trim());
        } else if (inFieldsSection && !line.match(/^\s+/)) {
          inFieldsSection = false;
        }
        
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          sig[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      }
      
      return {
        id: sig.id || sig.signature_id || 'unknown',
        name: sig.name || sig.title || 'Unnamed Signature',
        protocol: sig.protocol || 'Unknown',
        description: sig.description || sig.desc || '',
        fields: fields.length > 0 ? fields : undefined,
        file: relativePath,
      };
    }
  } catch (error) {
    console.error(`Error parsing signature file ${filePath}:`, error);
    return null;
  }
}

async function main() {
  const signaturesDir = join(process.cwd(), '..', 'signatures');
  const outputDir = join(process.cwd(), 'public', 'rulebook');
  const outputFile = join(outputDir, 'signatures.json');
  
  await mkdir(outputDir, { recursive: true });
  
  const signatureFiles = await findFiles(signaturesDir, ['.yml', '.yaml', '.json']);
  const signatures: Signature[] = [];
  
  for (const file of signatureFiles) {
    const signature = await parseSignature(file);
    if (signature) {
      signatures.push(signature);
    }
  }
  
  console.log(`Found ${signatures.length} signatures`);
  await writeFile(outputFile, JSON.stringify(signatures, null, 2));
  console.log(`Signatures index written to ${outputFile}`);
}

main().catch(console.error);
