import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface RepoStats {
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  commits: { date: string; count: number }[];
}

async function fetchRepoData(token: string): Promise<RepoStats> {
  const owner = 'cywf';
  const repo = 'SeaSentinel';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
  };
  
  // Fetch repository info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  const repoData = await repoRes.json();
  
  // Fetch languages
  const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
  const languages = await langRes.json();
  
  // Fetch commit activity (last 12 weeks)
  const commitsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
    { headers }
  );
  const commitActivity = await commitsRes.json();
  
  // Process commit activity
  const commits = Array.isArray(commitActivity) 
    ? commitActivity.slice(-12).map((week: any) => {
        const date = new Date(week.week * 1000);
        return {
          date: date.toISOString().split('T')[0],
          count: week.total || 0,
        };
      })
    : [];
  
  return {
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    watchers: repoData.watchers_count || 0,
    languages: languages || {},
    commits,
  };
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  const outputDir = join(process.cwd(), 'public', 'data');
  const outputFile = join(outputDir, 'stats.json');
  
  await mkdir(outputDir, { recursive: true });
  
  try {
    const stats = await fetchRepoData(token);
    await writeFile(outputFile, JSON.stringify(stats, null, 2));
    console.log(`Repository stats written to ${outputFile}`);
    console.log(`Stars: ${stats.stars}, Forks: ${stats.forks}, Watchers: ${stats.watchers}`);
  } catch (error) {
    console.error('Error fetching repository data:', error);
    // Create empty stats file as fallback
    await writeFile(outputFile, JSON.stringify({
      stars: 0,
      forks: 0,
      watchers: 0,
      languages: {},
      commits: [],
    }, null, 2));
  }
}

main().catch(console.error);
