import { useEffect, useState } from 'react';

interface Rule {
  id: string;
  name: string;
  severity: string;
  description: string;
  protocol?: string;
  file: string;
}

interface Signature {
  id: string;
  name: string;
  protocol: string;
  description: string;
  fields?: string[];
  file: string;
}

interface Playbook {
  title: string;
  summary: string;
  tags: string[];
  file: string;
}

const baseUrl = import.meta.env.BASE_URL || '/SeaSentinel';

export default function RulebookExplorer() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'signatures' | 'playbooks'>('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [protocolFilter, setProtocolFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [rulesRes, signaturesRes, playbooksRes] = await Promise.all([
          fetch(`${baseUrl}/rulebook/rules.json`).catch(() => ({ ok: false })),
          fetch(`${baseUrl}/rulebook/signatures.json`).catch(() => ({ ok: false })),
          fetch(`${baseUrl}/rulebook/playbooks.json`).catch(() => ({ ok: false })),
        ]);

        if (rulesRes.ok) {
          const data = await rulesRes.json();
          setRules(data);
        }
        if (signaturesRes.ok) {
          const data = await signaturesRes.json();
          setSignatures(data);
        }
        if (playbooksRes.ok) {
          const data = await playbooksRes.json();
          setPlaybooks(data);
        }
      } catch (error) {
        console.error('Error loading rulebook data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter;
    const matchesProtocol = protocolFilter === 'all' || rule.protocol === protocolFilter;
    return matchesSearch && matchesSeverity && matchesProtocol;
  });

  const filteredSignatures = signatures.filter((sig) => {
    const matchesSearch = sig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sig.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProtocol = protocolFilter === 'all' || sig.protocol === protocolFilter;
    return matchesSearch && matchesProtocol;
  });

  const filteredPlaybooks = playbooks.filter((playbook) => {
    const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'badge-error';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      case 'low': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  if (loading) {
    return (
      <div class="space-y-4">
        <div className="skeleton h-12 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  const hasData = rules.length > 0 || signatures.length > 0 || playbooks.length > 0;

  if (!hasData) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">No Rulebook Data Available</h2>
          <p className="mb-4">
            The rulebook is currently empty. To get started with SeaSentinel rules, signatures, and playbooks,
            create the following folder structure in your repository:
          </p>
          
          <div className="mockup-code mb-4">
            <pre><code>{`rules/
├── dsc_rules.yml
├── navtex_rules.yml
└── ais_rules.yml

signatures/
├── dsc_signatures.yml
├── navtex_signatures.yml
└── voice_patterns.yml

playbooks/
├── isolation_procedure.md
├── triage_steps.md
└── notification_protocol.md`}</code></pre>
          </div>

          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">Example Rule Structure</h3>
              <div className="mockup-code text-sm mt-2">
                <pre><code>{`id: dsc-unauthorized-distress
name: Unauthorized DSC Distress Alert
severity: critical
protocol: DSC
description: Detects DSC distress calls from unknown or blacklisted MMSIs
match:
  category: distress
  format: geographic-area`}</code></pre>
              </div>
            </div>
          </div>

          <div className="card-actions justify-end">
            <a
              href="https://github.com/cywf/SeaSentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View Repository
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200">
        <button
          className={`tab ${activeTab === 'rules' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules ({rules.length})
        </button>
        <button
          className={`tab ${activeTab === 'signatures' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('signatures')}
        >
          Signatures ({signatures.length})
        </button>
        <button
          className={`tab ${activeTab === 'playbooks' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('playbooks')}
        >
          Playbooks ({playbooks.length})
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            <div className="form-control flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab !== 'playbooks' && (
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={protocolFilter}
                  onChange={(e) => setProtocolFilter(e.target.value)}
                >
                  <option value="all">All Protocols</option>
                  <option value="DSC">DSC</option>
                  <option value="NAVTEX">NAVTEX</option>
                  <option value="AIS">AIS/NMEA</option>
                  <option value="Voice">Voice</option>
                </select>
              </div>
            )}
            {activeTab === 'rules' && (
              <div className="form-control">
                <select
                  className="select select-bordered"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'rules' && (
          <>
            {filteredRules.length === 0 ? (
              <div className="alert alert-info">
                <span>No rules match your current filters.</span>
              </div>
            ) : (
              filteredRules.map((rule) => (
                <div key={rule.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title">{rule.name}</h3>
                      <div className="flex gap-2">
                        <span className={`badge ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                        {rule.protocol && (
                          <span className="badge badge-outline">{rule.protocol}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm opacity-70">ID: {rule.id}</p>
                    <p>{rule.description}</p>
                    <div className="card-actions justify-end">
                      <a
                        href={`https://github.com/cywf/SeaSentinel/blob/main/${rule.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'signatures' && (
          <>
            {filteredSignatures.length === 0 ? (
              <div className="alert alert-info">
                <span>No signatures match your current filters.</span>
              </div>
            ) : (
              filteredSignatures.map((sig, idx) => (
                <div key={idx} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title">{sig.name}</h3>
                      <span className="badge badge-outline">{sig.protocol}</span>
                    </div>
                    {sig.id && <p className="text-sm opacity-70">ID: {sig.id}</p>}
                    <p>{sig.description}</p>
                    {sig.fields && sig.fields.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold mb-1">Matched Fields:</p>
                        <div className="flex flex-wrap gap-2">
                          {sig.fields.map((field, i) => (
                            <span key={i} className="badge badge-sm">{field}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="card-actions justify-end">
                      <a
                        href={`https://github.com/cywf/SeaSentinel/blob/main/${sig.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'playbooks' && (
          <>
            {filteredPlaybooks.length === 0 ? (
              <div className="alert alert-info">
                <span>No playbooks match your current filters.</span>
              </div>
            ) : (
              filteredPlaybooks.map((playbook, idx) => (
                <div key={idx} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">{playbook.title}</h3>
                    <p>{playbook.summary}</p>
                    {playbook.tags && playbook.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {playbook.tags.map((tag, i) => (
                          <span key={i} className="badge badge-primary">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="card-actions justify-end">
                      <a
                        href={`https://github.com/cywf/SeaSentinel/blob/main/${playbook.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
