import { useEffect, useState } from 'react';

interface Diagram {
  name: string;
  path: string;
  content: string;
}

const baseUrl = import.meta.env.BASE_URL || '/SeaSentinel';

export default function MermaidViewer() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    // Load diagrams list
    async function loadDiagrams() {
      try {
        const res = await fetch(`${baseUrl}/diagrams/diagrams.json`).catch(() => ({ ok: false }));
        if (res.ok) {
          const data = await res.json();
          setDiagrams(data);
        }
      } catch (error) {
        console.error('Error loading diagrams:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDiagrams();
  }, []);

  useEffect(() => {
    // Initialize Mermaid
    if (typeof window !== 'undefined' && !mermaidLoaded) {
      import('mermaid').then((mermaid) => {
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#fff',
            primaryBorderColor: '#1e40af',
            lineColor: '#8b5cf6',
            secondaryColor: '#8b5cf6',
            tertiaryColor: '#06b6d4',
          },
        });
        setMermaidLoaded(true);
      });
    }
  }, [mermaidLoaded]);

  useEffect(() => {
    // Render diagram when selection changes
    if (mermaidLoaded && diagrams.length > 0 && diagrams[selectedDiagram]) {
      const renderDiagram = async () => {
        try {
          const mermaid = (await import('mermaid')).default;
          const element = document.getElementById('mermaid-container');
          if (element) {
            element.innerHTML = diagrams[selectedDiagram].content;
            await mermaid.run({
              querySelector: '#mermaid-container',
            });
          }
        } catch (error) {
          console.error('Error rendering diagram:', error);
        }
      };
      renderDiagram();
    }
  }, [selectedDiagram, diagrams, mermaidLoaded]);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const index = diagrams.findIndex((d) => d.name === hash);
      if (index >= 0) {
        setSelectedDiagram(index);
      }
    }
  }, [diagrams]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-12 w-full"></div>
        <div className="skeleton h-96 w-full"></div>
      </div>
    );
  }

  if (diagrams.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">No Diagrams Available</h2>
          <p className="mb-4">
            No Mermaid diagrams found. To add diagrams, create <code>.mmd</code> files in a <code>mermaid/</code> directory
            in your repository, or add Mermaid code blocks to your README.
          </p>
          
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">Example Mermaid Diagram</h3>
              <div className="mockup-code text-sm mt-2">
                <pre><code>{`graph TD
    A[Vessel Radio] --> B[SeaSentinel IDS]
    B --> C{Threat?}
    C -->|Yes| D[Alert]
    C -->|No| E[Log]
    D --> F[Response Playbook]`}</code></pre>
              </div>
            </div>
          </div>

          <div className="card-actions justify-end">
            <a
              href="https://mermaid.js.org/intro/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Learn Mermaid Syntax →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagram Selector */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-2">Select Diagram</h3>
          <div className="flex flex-wrap gap-2">
            {diagrams.map((diagram, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDiagram(idx);
                  window.location.hash = diagram.name;
                }}
                className={`btn btn-sm ${
                  selectedDiagram === idx ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {diagram.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagram Display */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">{diagrams[selectedDiagram]?.name}</h2>
          <div 
            id="mermaid-container" 
            className="flex justify-center items-center p-4 bg-base-300 rounded-lg min-h-[400px] overflow-x-auto"
          >
            <div className="loading loading-spinner loading-lg"></div>
          </div>
          <div className="card-actions justify-between items-center mt-4">
            <a
              href={`https://github.com/cywf/SeaSentinel/blob/main/${diagrams[selectedDiagram]?.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              View Source →
            </a>
            <div className="text-sm opacity-70">
              Diagram {selectedDiagram + 1} of {diagrams.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
