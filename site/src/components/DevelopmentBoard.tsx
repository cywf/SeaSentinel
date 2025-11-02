import { useEffect, useState } from 'react';

interface Project {
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

interface Issue {
  id: string;
  title: string;
  number: number;
  url: string;
  labels: string[];
  state: string;
}

const baseUrl = import.meta.env.BASE_URL || '/SeaSentinel';

export default function DevelopmentBoard() {
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [useProjectsView, setUseProjectsView] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Try loading Projects v2 data first
        const projectRes = await fetch(`${baseUrl}/data/projects.json`).catch(() => ({ ok: false }));
        
        if (projectRes.ok) {
          const data = await projectRes.json();
          if (data && data.lanes && data.lanes.length > 0) {
            setProject(data);
            setUseProjectsView(true);
            setLoading(false);
            return;
          }
        }

        // Fallback: group open issues by labels
        setUseProjectsView(false);
        // Mock data for demonstration - in real implementation this would come from GitHub API
        setIssues([]);
      } catch (error) {
        console.error('Error loading development board data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  // Fallback view when no project data
  if (!useProjectsView || !project) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Development Board</h2>
          <p className="mb-4">
            The development board will display project status once GitHub Projects v2 data is available.
            In the meantime, you can view all issues on GitHub.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card bg-base-300">
              <div className="card-body">
                <h3 className="card-title text-lg">📋 To Do</h3>
                <p className="text-sm opacity-70">Issues awaiting work</p>
              </div>
            </div>
            <div className="card bg-base-300">
              <div className="card-body">
                <h3 className="card-title text-lg">🚧 In Progress</h3>
                <p className="text-sm opacity-70">Issues being worked on</p>
              </div>
            </div>
            <div className="card bg-base-300">
              <div className="card-body">
                <h3 className="card-title text-lg">✅ Done</h3>
                <p className="text-sm opacity-70">Completed issues</p>
              </div>
            </div>
          </div>
          <div className="card-actions justify-end mt-4">
            <a
              href="https://github.com/cywf/SeaSentinel/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View Issues on GitHub →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Kanban board view with Projects v2 data
  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {project.lanes.map((lane, idx) => (
          <div key={idx} className="flex-shrink-0 w-80">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">
                  {lane.name}
                  <span className="badge badge-primary">{lane.issues.length}</span>
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {lane.issues.length === 0 ? (
                    <p className="text-sm opacity-50 text-center py-4">No issues</p>
                  ) : (
                    lane.issues.map((issue) => (
                      <a
                        key={issue.id}
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card bg-base-300 hover:bg-base-100 transition cursor-pointer"
                      >
                        <div className="card-body p-4">
                          <h4 className="font-semibold text-sm mb-2">{issue.title}</h4>
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            <span>#{issue.number}</span>
                          </div>
                          {issue.labels && issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {issue.labels.slice(0, 3).map((label, i) => (
                                <span key={i} className="badge badge-xs">{label}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <a
          href="https://github.com/cywf/SeaSentinel/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
        >
          View Full Project Board on GitHub →
        </a>
      </div>
    </div>
  );
}
