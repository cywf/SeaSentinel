import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface Discussion {
  id: string;
  title: string;
  category: string;
  author: string;
  createdAt: string;
  url: string;
  commentCount: number;
}

async function fetchDiscussions(token: string): Promise<Discussion[]> {
  const owner = 'cywf';
  const repo = 'SeaSentinel';
  
  const query = `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        discussions(first: 25, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            id
            title
            url
            createdAt
            author {
              login
            }
            category {
              name
            }
            comments {
              totalCount
            }
          }
        }
      }
    }
  `;
  
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
    return [];
  }
  
  const nodes = data.data?.repository?.discussions?.nodes || [];
  
  return nodes.map((node: any) => ({
    id: node.id,
    title: node.title,
    category: node.category?.name || 'General',
    author: node.author?.login || 'unknown',
    createdAt: node.createdAt,
    url: node.url,
    commentCount: node.comments?.totalCount || 0,
  }));
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  const outputDir = join(process.cwd(), 'public', 'data');
  const outputFile = join(outputDir, 'discussions.json');
  
  await mkdir(outputDir, { recursive: true });
  
  try {
    const discussions = await fetchDiscussions(token);
    await writeFile(outputFile, JSON.stringify(discussions, null, 2));
    console.log(`Fetched ${discussions.length} discussions`);
    console.log(`Discussions written to ${outputFile}`);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    // Create empty discussions file as fallback
    await writeFile(outputFile, JSON.stringify([], null, 2));
  }
}

main().catch(console.error);
