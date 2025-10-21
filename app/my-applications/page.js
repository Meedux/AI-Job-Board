'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout } from '../../utils/designSystem';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Small UI helpers for formatting
const formatDateTime = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};
const formatShortDate = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
};
const formatFileSize = bytes => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
const getInitials = (name) => {
  if (!name) return 'JS';
  const parts = name.split(' ').filter(Boolean);
  return (parts[0]?.[0] || 'J') + (parts[1]?.[0] || '');
};
const statusBadgeClass = status => {
  const s = (status || '').toLowerCase();
  if (s === 'pending') return 'bg-yellow-500 text-black';
  if (s === 'shortlisted') return 'bg-green-600 text-white';
  if (s === 'rejected') return 'bg-red-600 text-white';
  if (s === 'offered' || s === 'accepted') return 'bg-indigo-600 text-white';
  return 'bg-slate-700 text-white';
};

// Small presentational icons used on the page
function IconLocation() {
  return (
    <svg className="w-4 h-4 mr-1 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="w-4 h-4 mr-1 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconPaperclip() {
  return (
    <svg className="w-4 h-4 mr-1 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21.44 11.05L12.7 19.79a5 5 0 01-7.07 0 5 5 0 010-7.07l8-8a4 4 0 015.66 5.66L11.29 17.6a2 2 0 01-2.83 0 2 2 0 010-2.83l7.07-7.07" />
    </svg>
  );
}

function StatusIcon({ status }) {
  const s = (status || '').toLowerCase();
  if (s === 'pending') {
    return (
      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  if (s === 'shortlisted') {
    return (
      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  if (s === 'rejected') {
    return (
      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formsCache, setFormsCache] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      const fetchApplications = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/applications', { credentials: 'include' });
          const data = await response.json();
          if (!cancelled) {
            if (data.success) {
              setApplications(Array.isArray(data.applications) ? data.applications : []);
            } else {
              setError(data.message || 'Unable to load applications');
            }
          }
        } catch (err) {
          if (!cancelled) setError('Failed to fetch applications');
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      fetchApplications();
    } else {
      setApplications([]);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [user]);

  // small mount animation trigger
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const toggleExpand = async (app) => {
    const id = expandedId === app.id ? null : app.id;
    setExpandedId(id);

    const jobId = app?.job?.id;
    if (id && jobId && typeof formsCache[jobId] === 'undefined') {
      try {
        const r = await fetch(`/api/application-forms?jobId=${jobId}`, { credentials: 'include' });
        const data = await r.json();
        if (data.success && data.form) {
          const rawFields = Array.isArray(data.form.fields) ? data.form.fields : (typeof data.form.fields === 'string' ? JSON.parse(data.form.fields) : []);
          const normalized = rawFields.map((f, i) => ({
            id: String(f.id ?? `f_${i}`),
            label: f.label || f.question || f.name || `Question ${i + 1}`
          }));
          setFormsCache(prev => ({ ...prev, [jobId]: normalized }));
        } else {
          setFormsCache(prev => ({ ...prev, [jobId]: null }));
        }
      } catch (err) {
        console.warn('Error fetching form for application details:', err);
        setFormsCache(prev => ({ ...prev, [jobId]: null }));
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />

        <main className={layout.container}>
          <div className="max-w-6xl mx-auto py-12">
            <div className={`${components.card.base} ${components.card.padding}`}>

              <header className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className={`${typography.h2} ${colors.neutral.textPrimary}`}>My Applications</h1>
                  <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mt-2`}>Track the roles you applied for, view your attachments, and review prescreen answers.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/jobs" className={`${components.button.base} ${components.button.ghost} ${components.button.sizes.medium}`}>Browse Jobs</Link>
                </div>
              </header>

              <section>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={`${components.card.base} ${components.card.padding} animate-pulse`} style={{ animationDelay: `${i * 75}ms` }}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gray-800 rounded-md shadow-sm" />
                          <div className="flex-1">
                            <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
                            <div className="h-3 bg-gray-800 rounded w-full max-w-sm" />
                            <div className="h-3 bg-gray-800 rounded w-1/3 mt-3" />
                          </div>
                          <div className="w-28 h-10 bg-gray-800 rounded ml-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Error loading applications: {error}</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="max-w-sm mx-auto">
                      <div className={`inline-flex items-center justify-center w-24 h-24 ${colors.neutral.backgroundTertiary} rounded-full mb-6`}>
                        <svg className={`w-12 h-12 ${colors.neutral.textMuted}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M8 3h8l2 4H6l2-4z" />
                        </svg>
                      </div>
                      <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}>No Applications Yet</h3>
                      <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-6`}>You haven't applied to any jobs yet — when you apply, you'll see them here with attachments and answers.</p>
                      <Link href="/jobs" className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}>Browse Jobs</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app, idx) => {
                      const appliedAt = app.appliedAt || app.createdAt || app.created_at;
                      const companyName = app.job?.company?.name || app.job?.company_name || '';
                      const logo = app.job?.company?.logoUrl || app.company?.logoUrl;
                      const fileCount = app.fileData ? Object.keys(app.fileData).length : 0;
                      const cardDelay = `${idx * 80}ms`;
                      const appearClass = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3';
                      return (
                        <div key={app.id} className={`${components.card.base} ${components.card.padding} ${components.card.hover} transition-all duration-300 ease-out transform ${appearClass} shadow-sm rounded-lg`} style={{ transitionDelay: cardDelay }}>
                          <div className="md:flex md:items-start md:justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {logo ? (
                                  <img src={logo} alt={`${companyName || 'Company'} logo`} className="w-14 h-14 rounded-md object-cover border border-gray-700" />
                                ) : (
                                  <div className="w-14 h-14 rounded-md bg-gray-800 flex items-center justify-center text-white font-semibold">
                                    {getInitials(companyName || app.job?.title)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className={`${typography.h4} ${colors.neutral.textPrimary} truncate`}>
                                  <Link href={`/jobs/${app.job?.id}`} className="hover:underline">{app.job?.title || 'Untitled Position'}</Link>
                                </h3>
                                <div className="flex items-center gap-3 text-sm mt-1">
                                  <span className={`${colors.neutral.textSecondary} font-medium`}>{companyName || 'Company'}</span>
                                  {app.job?.location && (
                                    <span className={`${colors.neutral.textMuted} flex items-center gap-1`}>
                                      <IconLocation />{app.job.location}
                                    </span>
                                  )}
                                  {app.job?.type && <span className="ml-2 px-2 py-0.5 rounded bg-gray-800 text-xs">{app.job.type}</span>}
                                </div>
                                <p className={`text-sm mt-3 ${colors.neutral.textSecondary} line-clamp-2`}>{(app.applicationData?.cover_letter || app.applicationData?.coverLetter) ? (app.applicationData.cover_letter || app.applicationData.coverLetter) : 'No cover letter provided'}</p>
                                <div className="flex items-center gap-3 text-xs mt-3">
                                  <div className={`${colors.neutral.textMuted} inline-flex items-center`}>
                                    <IconPaperclip />{fileCount > 0 ? `${fileCount} attachment${fileCount > 1 ? 's' : ''}` : 'No attachments'}
                                  </div>
                                  <div className={`${colors.neutral.textMuted} inline-flex items-center`}>
                                    <IconCalendar />Applied {formatShortDate(appliedAt)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0 mt-3 md:mt-0 text-right">
                              <div className="flex items-center gap-3 justify-end">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(app.status)}`}>
                                  <StatusIcon status={app.status} />{ (app.status || 'pending').toUpperCase() }
                                </span>
                              </div>
                              <div className={`${colors.neutral.textMuted} mt-2 text-sm`}>{formatDateTime(appliedAt)}</div>
                              <div className="mt-3 flex gap-2 justify-end">
                                <button
                                  onClick={() => toggleExpand(app)}
                                  aria-expanded={expandedId === app.id}
                                  className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small} hover:scale-[1.02] transition-transform`}
                                >
                                  {expandedId === app.id ? 'Hide Details' : 'View Details'}
                                </button>
                                <Link href={`/jobs/${app.job?.id}`} className={`${components.button.base} ${components.button.ghost} ${components.button.sizes.small}`}>
                                  View Job
                                </Link>
                              </div>
                            </div>
                          </div>

                          {expandedId === app.id && (
                            <div className="mt-4 border-t border-gray-700 pt-4 text-sm fadeInUp">
                              <h4 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3`}>Application Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                  <p className={`${colors.neutral.textMuted} mb-2`}><strong>Applied On:</strong> {formatDateTime(appliedAt)}</p>
                                  <p className={`${colors.neutral.textMuted} mb-2`}><strong>Status:</strong> {app.status || 'pending'}</p>
                                  <p className={`${colors.neutral.textMuted} mb-2`}><strong>Cover Letter:</strong></p>
                                  <div className={`${colors.neutral.textSecondary} whitespace-pre-wrap`}>{app.applicationData?.cover_letter || app.applicationData?.coverLetter || '—'}</div>
                                </div>

                                <div>
                                  <p className={`${colors.neutral.textMuted} mb-2`}><strong>Files</strong></p>
                                  {app.fileData && Object.keys(app.fileData).length > 0 ? (
                                    <div className="space-y-3">
                                      {Object.entries(app.fileData).map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                                          <div>
                                            <div className={`${colors.neutral.textSecondary} font-medium flex items-center gap-2`}> 
                                              <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                <path d="M21.44 11.05L12.7 19.79a5 5 0 01-7.07 0 5 5 0 010-7.07l8-8a4 4 0 015.66 5.66L11.29 17.6a2 2 0 01-2.83 0 2 2 0 010-2.83l7.07-7.07" />
                                              </svg>
                                              <span>{v.filename || k}</span>
                                            </div>
                                            <div className={`${colors.neutral.textMuted} text-xs`}>{v.size ? `${formatFileSize(v.size)}` : ''}{v.type ? ` • ${v.type}` : ''}</div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {v.url ? (
                                              <a href={v.url} target="_blank" rel="noreferrer" className={`${components.button.base} ${components.button.sizes.small} ${components.button.primary} inline-flex items-center gap-2`}>
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                  <polyline points="7 10 12 5 17 10" />
                                                  <line x1="12" y1="5" x2="12" y2="19" />
                                                </svg>
                                                Download
                                              </a>
                                            ) : (
                                              <span className={`${colors.neutral.textMuted} text-xs`}>No file URL</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className={`${colors.neutral.textSecondary}`}>No files attached</div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-6">
                                <h5 className={`${typography.h5} ${colors.neutral.textPrimary} mb-2`}>Prescreen Answers</h5>
                                {formsCache[app.job?.id] ? (
                                  <div className="space-y-2">
                                    {formsCache[app.job?.id].map(fieldMeta => (
                                      <div key={fieldMeta.id} className="bg-gray-800 p-3 rounded">
                                        <div className={`${colors.neutral.textMuted} text-xs`}>{fieldMeta.label}</div>
                                        <div className={`${colors.neutral.textSecondary} mt-1`}>{String(app.applicationData?.[fieldMeta.id] ?? app.applicationData?.[fieldMeta.id] ?? '—')}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className={`${colors.neutral.textSecondary}`}>Prescreen answers are available but the form metadata could not be loaded.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
      <style jsx>{`
        .fadeInUp { animation: fadeInUp 320ms cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </ProtectedRoute>
  );
}
