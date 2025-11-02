import { useEffect, useState } from 'react';

interface Discussion {
  id: string;
  title: string;
  category: string;
  author: string;
  createdAt: string;
  url: string;
  commentCount: number;
}

const baseUrl = import.meta.env.BASE_URL || '/SeaSentinel';

export default function DiscussionsList() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function loadDiscussions() {
      try {
        const res = await fetch(`${baseUrl}/data/discussions.json`);
        if (res.ok) {
          const data = await res.json();
          setDiscussions(data);
        }
      } catch (error) {
        console.error('Error loading discussions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDiscussions();
  }, []);

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || discussion.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(discussions.map((d) => d.category)));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-12 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">No Discussions Yet</h2>
          <p>
            Be the first to start a discussion! Visit the GitHub Discussions page to begin.
          </p>
          <div className="card-actions justify-end">
            <a
              href="https://github.com/cywf/SeaSentinel/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Start a Discussion →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <div className="form-control flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search discussions..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="alert alert-info">
            <span>No discussions match your current filters.</span>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div key={discussion.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="card-title mb-2">
                      <a
                        href={discussion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-hover"
                      >
                        {discussion.title}
                      </a>
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm opacity-70">
                      <span className="badge badge-outline">{discussion.category}</span>
                      <span>by {discussion.author}</span>
                      <span>•</span>
                      <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{discussion.commentCount} comments</span>
                    </div>
                  </div>
                  <a
                    href={discussion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost"
                  >
                    View →
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Link to GitHub */}
      <div className="text-center pt-4">
        <a
          href="https://github.com/cywf/SeaSentinel/discussions"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          View All on GitHub →
        </a>
      </div>
    </div>
  );
}
