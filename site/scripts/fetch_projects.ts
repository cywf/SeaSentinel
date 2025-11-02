import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface ProjectData {
  lanes: {
    name: string;
    issues: {
      id: string;
      title: string;
      number: number;
      url: string;
      labels: string[];
    }[];
  }[];
}

async function fetchProjects(token: string): Promise<ProjectData> {
  const owner = 'cywf';
  const repo = 'SeaSentinel';
  
  // Try to fetch Projects v2 data
  const query = `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        projectsV2(first: 1) {
          nodes {
            id
            title
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    id
                    title
                    number
                    url
                    labels(first: 10) {
                      nodes {
                        name
                      }
                    }
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await res.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }
    
    const project = data.data?.repository?.projectsV2?.nodes?.[0];
    if (!project) {
      throw new Error('No projects found');
    }
    
    // Organize issues by status
    const lanes = new Map<string, any[]>();
    lanes.set('To Do', []);
    lanes.set('In Progress', []);
    lanes.set('Done', []);
    
    for (const item of project.items.nodes) {
      if (!item.content) continue;
      
      let status = 'To Do';
      for (const fieldValue of item.fieldValues.nodes) {
        if (fieldValue.field?.name === 'Status') {
          status = fieldValue.name;
          break;
        }
      }
      
      const issue = {
        id: item.content.id,
        title: item.content.title,
        number: item.content.number,
        url: item.content.url,
        labels: item.content.labels?.nodes?.map((l: any) => l.name) || [],
      };
      
      if (!lanes.has(status)) {
        lanes.set(status, []);
      }
      lanes.get(status)!.push(issue);
    }
    
    return {
      lanes: Array.from(lanes.entries()).map(([name, issues]) => ({
        name,
        issues,
      })),
    };
  } catch (error) {
    console.log('Projects v2 not available, falling back to issues by labels');
    
    // Fallback: fetch open issues and group by status labels
    const issuesRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
        },
      }
    );
    
    const issues = await issuesRes.json();
    
    const lanes = {
      'To Do': [],
      'In Progress': [],
      'Done': [],
    };
    
    for (const issue of issues) {
      if (issue.pull_request) continue; // Skip PRs
      
      const labelNames = issue.labels.map((l: any) => l.name.toLowerCase());
      let status = 'To Do';
      
      if (labelNames.some((l: string) => l.includes('progress') || l.includes('doing'))) {
        status = 'In Progress';
      } else if (labelNames.some((l: string) => l.includes('done') || l.includes('complete'))) {
        status = 'Done';
      }
      
      lanes[status as keyof typeof lanes].push({
        id: issue.id.toString(),
        title: issue.title,
        number: issue.number,
        url: issue.html_url,
        labels: issue.labels.map((l: any) => l.name),
      });
    }
    
    return {
      lanes: Object.entries(lanes).map(([name, issues]) => ({
        name,
        issues,
      })),
    };
  }
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  const outputDir = join(process.cwd(), 'public', 'data');
  const outputFile = join(outputDir, 'projects.json');
  
  await mkdir(outputDir, { recursive: true });
  
  try {
    const projectData = await fetchProjects(token);
    await writeFile(outputFile, JSON.stringify(projectData, null, 2));
    console.log(`Project data written to ${outputFile}`);
    const totalIssues = projectData.lanes.reduce((sum, lane) => sum + lane.issues.length, 0);
    console.log(`Total issues across all lanes: ${totalIssues}`);
  } catch (error) {
    console.error('Error fetching project data:', error);
    // Create empty project file as fallback
    await writeFile(outputFile, JSON.stringify({ lanes: [] }, null, 2));
  }
}

main().catch(console.error);
