import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

interface Playbook {
  title: string;
  summary: string;
  tags: string[];
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

async function parsePlaybook(filePath: string): Promise<Playbook | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const relativePath = filePath.replace(process.cwd() + '/', '');
    
    // Extract frontmatter if present
    let title = '';
    let summary = '';
    let tags: string[] = [];
    
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]+)\]/);
      
      if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      if (tagsMatch) tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
    }
    
    // Extract first heading as title if not in frontmatter
    if (!title) {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        title = headingMatch[1].trim();
      } else {
        title = filePath.split('/').pop()?.replace(/\.(md|markdown)$/, '') || 'Unnamed Playbook';
      }
    }
    
    // Extract first paragraph as summary (skip frontmatter and title)
    let contentWithoutFrontmatter = content.replace(/^---\n[\s\S]+?\n---\n/, '');
    contentWithoutFrontmatter = contentWithoutFrontmatter.replace(/^#\s+.+$/m, '');
    const paragraphMatch = contentWithoutFrontmatter.match(/\n\n([^\n]+)/);
    if (paragraphMatch) {
      summary = paragraphMatch[1].trim().substring(0, 200);
      if (summary.length === 200) summary += '...';
    }
    
    // Extract tags from content if not in frontmatter
    if (tags.length === 0) {
      const commonTags = ['isolation', 'triage', 'notification', 'response', 'detection', 'mitigation'];
      for (const tag of commonTags) {
        if (content.toLowerCase().includes(tag)) {
          tags.push(tag.charAt(0).toUpperCase() + tag.slice(1));
        }
      }
    }
    
    return {
      title,
      summary: summary || 'No summary available',
      tags,
      file: relativePath,
    };
  } catch (error) {
    console.error(`Error parsing playbook file ${filePath}:`, error);
    return null;
  }
}

async function main() {
  const playbooksDir = join(process.cwd(), '..', 'playbooks');
  const outputDir = join(process.cwd(), 'public', 'rulebook');
  const outputFile = join(outputDir, 'playbooks.json');
  
  await mkdir(outputDir, { recursive: true });
  
  const playbookFiles = await findFiles(playbooksDir, ['.md', '.markdown']);
  const playbooks: Playbook[] = [];
  
  for (const file of playbookFiles) {
    const playbook = await parsePlaybook(file);
    if (playbook) {
      playbooks.push(playbook);
    }
  }
  
  console.log(`Found ${playbooks.length} playbooks`);
  await writeFile(outputFile, JSON.stringify(playbooks, null, 2));
  console.log(`Playbooks index written to ${outputFile}`);
}

main().catch(console.error);
