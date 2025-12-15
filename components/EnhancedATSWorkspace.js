'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, Settings, Users, Lock, Unlock, Edit3, Trash2, 
  MoreVertical, Grid, List, Calendar, Filter, Search,
  Download, Share2, BookOpen, Tag, Bell, Eye, 
  ChevronDown, ChevronRight, BarChart3, Target,
  Sparkles, Brain, Zap, Clock, CheckCircle, AlertCircle,
  Copy, MoveRight, X, Star, Mail, NotebookPen, MapPin, Phone
} from 'lucide-react';
import ATSKanbanCard from './ATSKanbanCard';
import ResumeContactReveal from './ResumeContactReveal';

// Default workspace columns
const DEFAULT_COLUMNS = [
  { 
    id: 'new', 
    name: 'New Applications', 
    color: 'bg-blue-600', 
    isLocked: true,
    description: 'Newly received applications waiting for review',
    automationRules: ['Auto-tag new applications', 'Send acknowledgment email']
  },
  { 
    id: 'reviewing', 
    name: 'Under Review', 
    color: 'bg-yellow-600',
    isLocked: false,
    description: 'Applications being reviewed by the team',
    automationRules: []
  },
  { 
    id: 'phone_screening', 
    name: 'Phone Screening', 
    color: 'bg-orange-600',
    isLocked: false,
    description: 'Candidates scheduled for phone screening',
    automationRules: ['Auto-schedule reminder', 'Send screening questions']
  },
  { 
    id: 'technical_interview', 
    name: 'Technical Interview', 
    color: 'bg-purple-600',
    isLocked: false,
    description: 'Technical assessment stage',
    automationRules: ['Send technical test', 'Schedule tech interview']
  },
  { 
    id: 'final_interview', 
    name: 'Final Interview', 
    color: 'bg-indigo-600',
    isLocked: false,
    description: 'Final round with decision makers',
    automationRules: ['Schedule final interview', 'Prepare offer package']
  },
  { 
    id: 'offer_extended', 
    name: 'Offer Extended', 
    color: 'bg-green-600',
    isLocked: false,
    description: 'Offers sent and awaiting response',
    automationRules: ['Send offer letter', 'Track response deadline']
  },
  { 
    id: 'hired', 
    name: 'Hired', 
    color: 'bg-emerald-600',
    isLocked: true,
    description: 'Successfully hired candidates',
    automationRules: ['Start onboarding process', 'Create employee profile']
  },
  { 
    id: 'rejected', 
    name: 'Rejected', 
    color: 'bg-red-600',
    isLocked: true,
    description: 'Candidates not selected',
    automationRules: ['Send rejection email', 'Archive application']
  }
];

const BASE_FILTERS = {
  status: 'all',
  priority: 'all',
  rating: null,
  hasResume: null,
  dateRange: { start: null, end: null },
  jobMatchMin: null,
  tags: [],
  onlyRevealedContacts: false
};

function parseFilename(contentDisposition, fallback = 'ats-export') {
  if (!contentDisposition) return fallback;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
  if (match) {
    const encoded = match[1] || match[2];
    try {
      return decodeURIComponent(encoded);
    } catch (_) {
      return encoded;
    }
  }
  return fallback;
}

function triggerBrowserDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function EnhancedATSWorkspace({ workspaceId }) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(() => ({ ...BASE_FILTERS }));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isActionProcessing, setIsActionProcessing] = useState(false);
  const [credits, setCredits] = useState({ available: 0, allocated: 0, used: 0 });
  const [collaborators, setCollaborators] = useState([]);
  const [contactModalData, setContactModalData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: 'Main Hiring Workspace',
    description: 'Primary workspace for all hiring activities',
    isPublic: false,
    maxCollaborators: 5,
    currentCollaborators: 3
  });

  const loadApplications = useCallback(async (overrides = {}) => {
    const params = new URLSearchParams();
    const nextSearch = overrides.searchTerm ?? searchTerm;
    const nextFilters = { ...filters, ...(overrides.filters || {}) };

    if (nextSearch) params.set('search', nextSearch);
    if (workspaceId) params.set('workspaceId', workspaceId);
    if (nextFilters.status && nextFilters.status !== 'all') params.set('status', nextFilters.status);
    if (nextFilters.priority && nextFilters.priority !== 'all') params.set('priority', nextFilters.priority);
    if (nextFilters.rating) params.set('rating', nextFilters.rating);
    if (typeof nextFilters.hasResume === 'boolean') params.set('hasResume', nextFilters.hasResume ? 'true' : 'false');
    if (nextFilters.jobMatchMin) params.set('jobMatchMin', String(nextFilters.jobMatchMin));
    if (nextFilters.onlyRevealedContacts) params.set('onlyRevealedContacts', 'true');
    if (nextFilters.dateRange?.start) params.set('appliedFrom', nextFilters.dateRange.start);
    if (nextFilters.dateRange?.end) params.set('appliedTo', nextFilters.dateRange.end);
    if (nextFilters.tags?.length) {
      params.set('tag', nextFilters.tags[0]);
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/ats/applications?${params.toString()}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to load applications');
      }
      const data = await response.json();
      const incomingApps = data.applications || [];
      const normalizedApps = incomingApps.map(app => {
        const flagged = typeof app.flagged === 'boolean' ? app.flagged : app.stage === 'new';
        const isNewLead = typeof app.isNewLead === 'boolean' ? app.isNewLead : flagged;
        return { ...app, flagged, isNewLead };
      });
      setApplications(normalizedApps);
      setSelectedApplicationIds(prev => prev.filter(id => normalizedApps.some(app => app.id === id)));
      setSelectedForCompare(prev => prev.filter(candidate => normalizedApps.some(app => app.id === candidate.id)));
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, workspaceId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/user/credits');
        if (!response.ok) return;
        const data = await response.json();
        setCredits({
          available: data.availableResumeCredits || 0,
          allocated: data.allocatedResumeCredits || 0,
          used: data.usedResumeCredits || 0
        });
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
    };

    fetchCredits();
  }, []);

  // Column management functions
  const addNewColumn = () => {
    const newColumn = {
      id: `custom_${Date.now()}`,
      name: 'New Column',
      color: 'bg-gray-600',
      isLocked: false,
      description: 'Custom workflow stage',
      automationRules: []
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const updateColumn = (columnId, updates) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
  };

  const deleteColumn = (columnId) => {
    const column = columns.find(col => col.id === columnId);
    if (column?.isLocked) return;
    
    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const reorderColumns = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setColumns(items);
  };

  const handleCardDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const applicationId = Number(draggableId);
    const nextStage = destination.droppableId;
    const previousStage = source.droppableId;
    const previousApp = applications.find(app => app.id === applicationId);
    const shouldClearFlag = nextStage === 'phone_screening';

    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? {
              ...app,
              stage: nextStage,
              flagged: shouldClearFlag ? false : app.flagged,
              isNewLead: shouldClearFlag ? false : app.isNewLead
            }
          : app
      )
    );

    try {
      const response = await fetch('/api/ats/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applicationId, stage: nextStage })
      });

      if (!response.ok) {
        throw new Error('Failed to update application stage');
      }

      const data = await response.json();
      if (data?.application) {
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, ...data.application } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application stage:', error);
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                stage: previousStage,
                flagged: previousApp?.flagged ?? app.flagged,
                isNewLead: previousApp?.isNewLead ?? app.isNewLead
              }
            : app
        )
      );
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      if (filters.status !== 'all' && application.status && application.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && application.priority !== filters.priority) {
        return false;
      }
      if (filters.rating && Number(application.rating || 0) < Number(filters.rating)) {
        return false;
      }
      if (filters.hasResume === 'with') {
        const hasResumeData = Boolean(application.resumeUrl || application.fileData?.resume?.url || application.applicant?.resumeUrl);
        if (!hasResumeData) return false;
      }
      if (filters.hasResume === 'without') {
        const hasResumeData = Boolean(application.resumeUrl || application.fileData?.resume?.url || application.applicant?.resumeUrl);
        if (hasResumeData) return false;
      }
      if (filters.jobMatchMin && (application.jobMatchScore ?? 0) < Number(filters.jobMatchMin)) {
        return false;
      }
      if (filters.dateRange?.start || filters.dateRange?.end) {
        const appliedTimestamp = application.appliedAt || application.createdAt;
        if (!appliedTimestamp) {
          return false;
        }
        const appliedDate = new Date(appliedTimestamp);
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (appliedDate < startDate) return false;
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (appliedDate > endDate) return false;
        }
      }
      if (Array.isArray(filters.tags) && filters.tags.length > 0) {
        const appTags = application.tags || [];
        const hasAllTags = filters.tags.every(tag => appTags.includes(tag));
        if (!hasAllTags) return false;
      }
      if (filters.onlyRevealedContacts) {
        const contactAvailable = application.contactVisible !== false
          ? true
          : Boolean(application.contactRevealed || (application.contactRevealHistory || []).length > 0);
        if (!contactAvailable) return false;
      }
      return true;
    });
  }, [applications, filters]);

  const applicationsByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredApplications.filter(app => app.stage === column.id);
      return acc;
    }, {});
  }, [columns, filteredApplications]);

  const getApplicationsByColumn = useCallback((columnId) => {
    return applicationsByColumn[columnId] || [];
  }, [applicationsByColumn]);

  const getColumnStats = useCallback((columnId) => {
    const apps = applicationsByColumn[columnId] || [];
    return {
      total: apps.length,
      new: apps.filter(app => app.status === 'new' || app.isNew).length,
      urgent: apps.filter(app => app.priority === 'urgent').length,
      overdue: apps.filter(app => app.isOverdue).length
    };
  }, [applicationsByColumn]);

  const selectedCount = selectedApplicationIds.length;

  const handleToggleSelect = useCallback((application, isChecked) => {
    setSelectedApplicationIds(prev => {
      if (isChecked) {
        if (prev.includes(application.id)) return prev;
        return [...prev, application.id];
      }
      return prev.filter(id => id !== application.id);
    });

    if (!isChecked) {
      setSelectedForCompare(prev => prev.filter(candidate => candidate.id !== application.id));
    }
  }, []);

  const handleSelectAllInColumn = useCallback((columnId) => {
    const columnApplications = getApplicationsByColumn(columnId);
    if (columnApplications.length === 0) return;

    setSelectedApplicationIds(prev => {
      const current = new Set(prev);
      const allSelected = columnApplications.every(app => current.has(app.id));
      if (allSelected) {
        columnApplications.forEach(app => current.delete(app.id));
      } else {
        columnApplications.forEach(app => current.add(app.id));
      }
      return Array.from(current);
    });
  }, [getApplicationsByColumn]);

  const clearSelection = useCallback(() => {
    setSelectedApplicationIds([]);
    setSelectedForCompare([]);
  }, []);

  const openAction = useCallback((type, applicationIds = [], context = {}) => {
    setActiveAction({ type, applicationIds, context });
  }, []);

  const handleCardAction = useCallback((action, candidate) => {
    switch (action) {
      case 'move':
        openAction('move', [candidate.id], { currentStage: candidate.stage });
        break;
      case 'note':
        openAction('note', [candidate.id], { candidate });
        break;
      case 'share':
        openAction('share', [candidate.id], { candidate });
        break;
      case 'more':
        openAction('more', [candidate.id], { candidate });
        break;
      default:
        break;
    }
  }, [openAction]);

  const handleBulkAction = useCallback((type) => {
    const applicationsToActOn = filteredApplications.filter(app => selectedApplicationIds.includes(app.id));
    if (applicationsToActOn.length === 0) return;
    openAction(type, applicationsToActOn.map(app => app.id), { applications: applicationsToActOn });
  }, [filteredApplications, openAction, selectedApplicationIds]);

  const handleContactReveal = useCallback((application) => {
    setContactModalData(application);
  }, []);

  const handleCompareToggle = useCallback((application) => {
    setSelectedForCompare(prev => {
      const exists = prev.find(item => item.id === application.id);
      if (exists) {
        return prev.filter(item => item.id !== application.id);
      }
      return [...prev, application];
    });
  }, []);

  const handleFilterUpdate = useCallback((nextFilters) => {
    setFilters(prev => ({ ...prev, ...nextFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ ...BASE_FILTERS });
  }, []);

  const handleExport = useCallback(async (format, idsOverride) => {
    const exportIds = Array.isArray(idsOverride) && idsOverride.length > 0
      ? idsOverride
      : selectedApplicationIds;

    if (!exportIds || exportIds.length === 0) return;

    setIsExporting(true);
    try {
      const response = await fetch('/api/ats/applications/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applicationIds: exportIds, format })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }

      if (format === 'google_sheets') {
        const data = await response.json();
        openAction('notice', [], {
          title: 'Google Sheet created',
          message: data.message || 'Your candidates were synced to Google Sheets.',
          url: data.sheetUrl
        });
        return;
      }

      const blob = await response.blob();
      const extensionMap = {
        csv: 'csv',
        excel: 'xlsx',
        pdf: 'pdf'
      };
      const fallbackName = `ats-applications.${extensionMap[format] || 'dat'}`;
      const filename = parseFilename(response.headers.get('Content-Disposition'), fallbackName);
      triggerBrowserDownload(blob, filename);
      openAction('notice', [], {
        title: 'Export ready',
        message: `Downloaded ${exportIds.length} application${exportIds.length > 1 ? 's' : ''}.`
      });
    } catch (error) {
      console.error('ATS export error:', error);
      openAction('notice', [], {
        title: 'Export failed',
        message: error.message || 'Unable to export applications right now.'
      });
    } finally {
      setIsExporting(false);
    }
  }, [openAction, selectedApplicationIds]);

  const performBulkAction = useCallback(async (actionType, applicationIds, payload) => {
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return { success: false };
    }

    const actionMap = {
      move: 'move_stage',
      note: 'add_note',
      priority: 'set_priority',
      tag: 'tag'
    };

    const apiAction = actionMap[actionType];
    if (!apiAction) {
      console.warn(`Unsupported bulk action: ${actionType}`);
      return { success: false };
    }

    setIsActionProcessing(true);

    try {
      const response = await fetch('/api/ats/applications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applicationIds, action: apiAction, payload })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Bulk action failed');
      }

      setApplications(prev => prev.map(app => {
        if (!applicationIds.includes(app.id)) return app;
        switch (actionType) {
          case 'move': {
            const shouldClear = payload.stage === 'phone_screening';
            return {
              ...app,
              stage: payload.stage,
              flagged: shouldClear ? false : app.flagged,
              isNewLead: shouldClear ? false : app.isNewLead
            };
          }
          case 'note':
            return { ...app, notes: payload.note };
          case 'priority':
            return { ...app, priority: payload.priority };
          case 'tag':
            return { ...app, tags: payload.tags };
          default:
            return app;
        }
      }));

      return { success: true };
    } catch (error) {
      console.error('Bulk action error:', error);
      openAction('notice', [], {
        title: 'Action failed',
        message: error.message || 'Unable to apply the selected bulk action.'
      });
      return { success: false, error };
    } finally {
      setIsActionProcessing(false);
    }
  }, [openAction]);

  const closeAction = useCallback(() => setActiveAction(null), []);

  const handleActionSubmit = useCallback(async (formData) => {
    if (!activeAction) return;
    const { type, applicationIds } = activeAction;

    if (type === 'move') {
      await performBulkAction('move', applicationIds, { stage: formData.stage });
      closeAction();
      return;
    }

    if (type === 'note') {
      await performBulkAction('note', applicationIds, { note: formData.note });
      closeAction();
      return;
    }

    if (type === 'priority') {
      await performBulkAction('priority', applicationIds, { priority: formData.priority });
      closeAction();
      return;
    }

    if (type === 'tag') {
      await performBulkAction('tag', applicationIds, { tags: formData.tags });
      closeAction();
      return;
    }
  }, [activeAction, closeAction, performBulkAction]);

  const closeContactModal = useCallback(() => setContactModalData(null), []);

  const handleContactRevealSuccess = useCallback((payload) => {
    if (!contactModalData) return;
    setApplications(prev => prev.map(app => {
      if (app.id !== contactModalData.id) return app;
      return {
        ...app,
        contactRevealed: true,
        contactVisible: true,
        applicant: {
          ...app.applicant,
          email: payload?.contactInfo?.email || app.applicant?.email,
          phone: payload?.contactInfo?.phone || app.applicant?.phone
        }
      };
    }));

    if (typeof payload?.remainingCredits === 'number') {
      setCredits(prev => ({ ...prev, available: payload.remainingCredits }));
    }

    closeContactModal();
  }, [closeContactModal, contactModalData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Workspace Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    {workspaceSettings.name}
                    <button className="text-gray-400 hover:text-white">
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </h1>
                  <p className="text-gray-400 mb-2">{workspaceSettings.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {workspaceSettings.currentCollaborators}/{workspaceSettings.maxCollaborators} collaborators
                    </span>
                    <span className="text-blue-400 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {columns.length} workflow stages
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
                
                <button
                  onClick={() => setIsManagingColumns(!isManagingColumns)}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Columns
                </button>
                
                <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                
                {/* View Mode Toggle */}
                <div className="bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-1 rounded transition-all duration-300 ${
                      viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded transition-all duration-300 ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics Panel */}
          <AnimatePresence>
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <WorkspaceAnalytics applications={filteredApplications} columns={columns} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Column Management Panel */}
          <AnimatePresence>
            {isManagingColumns && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <ColumnManagement 
                  columns={columns}
                  onAddColumn={addNewColumn}
                  onUpdateColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                  onReorderColumns={reorderColumns}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search candidates by name, skills, or any criteria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div className="flex gap-3 flex-wrap justify-end">
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">Priority: All</option>
                    <option value="urgent">Priority: Urgent</option>
                    <option value="high">Priority: High</option>
                    <option value="normal">Priority: Normal</option>
                    <option value="low">Priority: Low</option>
                  </select>

                  <select
                    value={filters.hasResume || 'any'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters(prev => ({ ...prev, hasResume: value === 'any' ? null : value }));
                    }}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="any">Resume: Any</option>
                    <option value="with">Resume: Available</option>
                    <option value="without">Resume: Missing</option>
                  </select>

                  <button
                    onClick={() => setShowAdvancedFilters(prev => !prev)}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {showAdvancedFilters ? 'Hide Filters' : 'Advanced'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-8"
              >
                <AdvancedFiltersPanel
                  filters={filters}
                  onChange={handleFilterUpdate}
                  onReset={handleResetFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {selectedCount > 0 && (
            <BulkSelectionBar
              count={selectedCount}
              onClear={clearSelection}
              isProcessing={isExporting}
              onMove={() => handleBulkAction('move')}
              onNote={() => handleBulkAction('note')}
              onShare={() => handleBulkAction('share')}
              onTag={() => handleBulkAction('tag')}
              onPriority={() => handleBulkAction('priority')}
              onExport={handleExport}
            />
          )}

          {/* Kanban Board */}
          {viewMode === 'kanban' && (
            <DragDropContext onDragEnd={handleCardDragEnd}>
              <div className="overflow-x-auto">
                <div className="flex gap-6 pb-6 min-w-fit">
                  {columns.map((column, index) => {
                    const columnApplications = getApplicationsByColumn(column.id);
                    const columnSelected = columnApplications.length > 0
                      && columnApplications.every(app => selectedApplicationIds.includes(app.id));

                    return (
                      <motion.div
                        key={column.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-80 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50"
                      >
                        <ColumnHeader 
                          column={column} 
                          stats={getColumnStats(column.id)}
                          isManaging={isManagingColumns}
                          onUpdate={updateColumn}
                          onDelete={deleteColumn}
                          columnSelected={columnSelected}
                          onToggleColumnSelection={() => handleSelectAllInColumn(column.id)}
                        />
                        
                        <Droppable droppableId={column.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-4 min-h-96 transition-colors duration-200 ${
                                snapshot.isDraggingOver ? 'bg-gray-700/30' : ''
                              }`}
                            >
                              <AnimatePresence>
                                {columnApplications.map((application, cardIndex) => (
                                  <ATSKanbanCard
                                    key={application.id}
                                    candidate={application}
                                    index={cardIndex}
                                    isSelected={selectedApplicationIds.includes(application.id)}
                                    onToggleSelect={handleToggleSelect}
                                    onAction={handleCardAction}
                                    onRevealContact={handleContactReveal}
                                    onCompare={handleCompareToggle}
                                  />
                                ))}
                              </AnimatePresence>
                              {provided.placeholder}
                              
                              {columnApplications.length === 0 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-center py-8 text-gray-500"
                                >
                                  <div className="text-4xl mb-2">📭</div>
                                  <div className="text-sm">No candidates in this stage</div>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </DragDropContext>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border p-6 transition-all duration-300 ${
                    application.flagged ? 'border-amber-400/60 ring-1 ring-amber-300/30' : 'border-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        checked={selectedApplicationIds.includes(application.id)}
                        onChange={(e) => handleToggleSelect(application, e.target.checked)}
                      />
                      <div className="relative">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {application.applicant?.firstName?.[0]}{application.applicant?.lastName?.[0]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold text-lg truncate">
                            {application.applicant?.fullName || 'Unknown Candidate'}
                          </h3>
                          {application.flagged && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-200 border border-amber-400/40">
                              <Sparkles className="w-3 h-3" />
                              New lead
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-300 mt-2">
                          {application.applicant?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {application.contactVisible === false && !application.contactRevealed
                                ? '••••••@••••.com'
                                : application.applicant.email}
                            </span>
                          )}
                          {application.applicant?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {application.contactVisible === false && !application.contactRevealed
                                ? '+•••• ••• ••••'
                                : application.applicant.phone}
                            </span>
                          )}
                          {application.applicant?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {application.applicant.location}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-3">
                          <span>Match {application.jobMatchScore ?? 0}%</span>
                          <span className="capitalize">Priority {application.priority || 'normal'}</span>
                          {application.createdAt && (
                            <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {application.tags && application.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {application.tags.slice(0, 5).map(tag => (
                              <span key={tag} className="px-2 py-1 text-[11px] bg-purple-600/20 text-purple-200 rounded border border-purple-500/30">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        columns.find(col => col.id === application.stage)?.color || 'bg-gray-600'
                      }`}>
                        {columns.find(col => col.id === application.stage)?.name || 'Unknown Stage'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCardAction('move', application)}
                          className="px-3 py-2 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/30"
                        >
                          Move
                        </button>
                        <button
                          onClick={() => handleCardAction('note', application)}
                          className="px-3 py-2 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg border border-purple-500/30"
                        >
                          Note
                        </button>
                        <button
                          onClick={() => handleCardAction('share', application)}
                          className="px-3 py-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 rounded-lg border border-emerald-500/30"
                        >
                          Share
                        </button>
                        {application.contactVisible === false && !application.contactRevealed ? (
                          <button
                            onClick={() => handleContactReveal(application)}
                            className="px-3 py-2 text-xs bg-gray-700 text-gray-300 rounded-lg border border-gray-600"
                          >
                            Reveal Contact
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCompareToggle(application)}
                            className="px-3 py-2 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 rounded-lg border border-indigo-500/30"
                          >
                            Compare
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedForCompare.length > 1 && (
            <ComparePanel candidates={selectedForCompare} onRemove={handleCompareToggle} />
          )}
        </div>
      </div>
      </div>

      {activeAction && (
        <ActionModal
          action={activeAction}
          columns={columns}
          onClose={closeAction}
          onSubmit={handleActionSubmit}
          onNavigate={(type, context) => openAction(type, activeAction.applicationIds, context)}
          isProcessing={isActionProcessing}
        />
      )}

      {contactModalData && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl p-6 relative">
            <button
              onClick={closeContactModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
            <ResumeContactReveal
              targetUser={contactModalData.applicant || {}}
              applicationId={contactModalData.id}
              userCredits={credits.available}
              onReveal={handleContactRevealSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Column Header Component
function ColumnHeader({ column, stats, isManaging, onUpdate, onDelete, columnSelected, onToggleColumnSelection }) {
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState(column.name);

  const handleSave = () => {
    onUpdate(column.id, { name: columnName });
    setIsEditing(false);
  };

  return (
    <div className={`${column.color} text-white px-4 py-3 rounded-t-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-white/40"
            checked={Boolean(columnSelected)}
            onChange={() => stats.total > 0 && onToggleColumnSelection?.()}
            disabled={stats.total === 0}
          />
          {isEditing ? (
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              onBlur={handleSave}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm"
              autoFocus
            />
          ) : (
            <h3 className="font-semibold text-lg">{column.name}</h3>
          )}
          
          {column.isLocked ? (
            <Lock className="w-4 h-4 opacity-70" />
          ) : (
            <Unlock className="w-4 h-4 opacity-70" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-semibold">
            {stats.total}
          </span>
          
          {stats.urgent > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              {stats.urgent} urgent
            </span>
          )}
          
          {isManaging && !column.isLocked && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(column.id)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {column.description && (
        <p className="text-white/80 text-sm mt-1">{column.description}</p>
      )}
    </div>
  );
}

// Column Management Component
function ColumnManagement({ columns, onAddColumn, onUpdateColumn, onDeleteColumn, onReorderColumns }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Column Management
        </h3>
        <button
          onClick={onAddColumn}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Column
        </button>
      </div>
      
      <DragDropContext onDragEnd={onReorderColumns}>
        <Droppable droppableId="columns" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        min-w-64 bg-gray-700/50 rounded-lg p-4 border border-gray-600/50
                        ${snapshot.isDragging ? 'ring-2 ring-purple-500' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-4 h-4 rounded-full ${column.color}`} />
                        <div className="flex items-center gap-2">
                          {column.isLocked ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Unlock className="w-4 h-4 text-gray-400" />
                          )}
                          {!column.isLocked && (
                            <button
                              onClick={() => onDeleteColumn(column.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="text-white font-medium mb-2">{column.name}</h4>
                      <p className="text-gray-400 text-sm mb-3">{column.description}</p>
                      
                      {column.automationRules.length > 0 && (
                        <div>
                          <p className="text-purple-400 text-sm font-medium mb-2">Automation Rules:</p>
                          <ul className="text-gray-400 text-xs space-y-1">
                            {column.automationRules.map((rule, ruleIndex) => (
                              <li key={ruleIndex} className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-purple-400" />
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function AdvancedFiltersPanel({ filters, onChange, onReset }) {
  const [tagInput, setTagInput] = useState((filters.tags || []).join(', '));

  useEffect(() => {
    setTagInput((filters.tags || []).join(', '));
  }, [filters.tags]);

  const handleTagCommit = () => {
    const normalizedTags = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    onChange({ tags: normalizedTags });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400" />
          Advanced Filters
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-gray-400">Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onBlur={handleTagCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTagCommit();
              }
            }}
            placeholder="Comma-separated tags"
            className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-gray-400">Minimum Rating</label>
          <select
            value={filters.rating || ''}
            onChange={(e) => onChange({ rating: e.target.value ? Number(e.target.value) : null })}
            className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Any Rating</option>
            <option value="5">5 stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-gray-400">Job Match Threshold</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.jobMatchMin ?? 0}
              onChange={(e) => {
                const value = Number(e.target.value);
                onChange({ jobMatchMin: value === 0 ? null : value });
              }}
              className="flex-1 accent-blue-500"
            />
            <span className="text-sm text-gray-300 min-w-[45px] text-right">
              {filters.jobMatchMin ?? 'Any'}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-gray-400">Applied After</label>
          <input
            type="date"
            value={filters.dateRange?.start || ''}
            onChange={(e) => onChange({ dateRange: { ...filters.dateRange, start: e.target.value || null } })}
            className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-gray-400">Applied Before</label>
          <input
            type="date"
            value={filters.dateRange?.end || ''}
            onChange={(e) => onChange({ dateRange: { ...filters.dateRange, end: e.target.value || null } })}
            className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-gray-400">Contacts</label>
          <button
            onClick={() => onChange({ onlyRevealedContacts: !filters.onlyRevealedContacts })}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2 ${
              filters.onlyRevealedContacts
                ? 'border-green-500/60 bg-green-600/20 text-green-300'
                : 'border-gray-600/60 bg-gray-700/40 text-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            Reveal only
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkSelectionBar({
  count,
  onClear,
  isProcessing,
  onMove,
  onNote,
  onShare,
  onTag,
  onPriority,
  onExport
}) {
  return (
    <div className="sticky top-4 z-20 mb-6">
      <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg">
        <span className="text-sm text-gray-300">
          {count} candidate{count > 1 ? 's' : ''} selected
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onMove}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30"
          >
            Move To
          </button>
          <button
            onClick={onNote}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
          >
            Add Note
          </button>
          <button
            onClick={onPriority}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30"
          >
            Set Priority
          </button>
          <button
            onClick={onTag}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-200 border border-pink-500/30"
          >
            Manage Tags
          </button>
          <button
            onClick={onShare}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30"
          >
            Share
          </button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 mr-2">Export:</span>
            {['csv', 'excel', 'pdf', 'google_sheets'].map((format) => (
              <button
                key={format}
                onClick={() => onExport(format)}
                disabled={isProcessing}
                className={`px-2 py-1 text-[11px] uppercase tracking-wide rounded border ${
                  isProcessing
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-300'
                }`}
              >
                {format === 'google_sheets' ? 'Sheets' : format}
              </button>
            ))}
          </div>
          <button
            onClick={onClear}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionModal({ action, columns, onClose, onSubmit, onNavigate, isProcessing }) {
  const { type, context } = action;
  const isNotice = type === 'notice';
  const isShare = type === 'share';
  const isChooser = type === 'more';

  const [stage, setStage] = useState(context?.currentStage || columns?.[0]?.id || '');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState(context?.candidate?.priority || 'normal');
  const [tagsText, setTagsText] = useState((context?.candidate?.tags || []).join(', '));
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    setStage(context?.currentStage || columns?.[0]?.id || '');
    setNote('');
    setPriority(context?.candidate?.priority || 'normal');
    setTagsText((context?.candidate?.tags || []).join(', '));
    setShareStatus('');
  }, [action, columns, context?.candidate?.priority, context?.candidate?.tags, context?.currentStage]);

  const candidates = context?.applications || (context?.candidate ? [context.candidate] : []);

  const handleConfirm = async () => {
    if (isNotice) {
      onClose();
      return;
    }

    if (isShare) {
      try {
        const sharePayload = candidates.map(candidate => {
          const applicant = candidate.applicant || {};
          return [
            `Candidate: ${applicant.fullName || 'Unknown'}`,
            applicant.email ? `Email: ${applicant.email}` : null,
            applicant.phone ? `Phone: ${applicant.phone}` : null,
            `Stage: ${candidate.stage}`,
            candidate.jobMatchScore ? `Match Score: ${candidate.jobMatchScore}%` : null,
            candidate.tags && candidate.tags.length > 0 ? `Tags: ${candidate.tags.join(', ')}` : null
          ].filter(Boolean).join('\n');
        }).join('\n\n');

        await navigator.clipboard.writeText(sharePayload);
        setShareStatus('Copied candidate snapshot to clipboard.');
      } catch (error) {
        setShareStatus('Unable to copy to clipboard.');
      }
      return;
    }

    if (isChooser) {
      return;
    }

    if (type === 'move') {
      await onSubmit({ stage });
    } else if (type === 'note') {
      await onSubmit({ note });
    } else if (type === 'priority') {
      await onSubmit({ priority });
    } else if (type === 'tag') {
      const tags = tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      await onSubmit({ tags });
    }
  };

  const renderContent = () => {
    if (isNotice) {
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{context?.title || 'Notification'}</h3>
          <p className="text-sm text-gray-300">{context?.message}</p>
          {context?.url && (
            <a
              href={context.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-300 hover:text-blue-200"
            >
              <Share2 className="w-4 h-4" />
              Open in Google Sheets
            </a>
          )}
        </div>
      );
    }

    if (isShare) {
      const total = candidates.length;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Share Candidate Snapshot</h3>
            <p className="text-sm text-gray-300">
              Copy key candidate fields into your clipboard to share with teammates.
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-3 bg-gray-800/60 border border-gray-700/60 rounded-lg p-4">
            {candidates.map(candidate => (
              <div key={candidate.id} className="border border-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">
                    {candidate.applicant?.fullName || 'Unknown Candidate'}
                  </h4>
                  <span className="text-xs text-gray-400">Stage: {candidate.stage}</span>
                </div>
                <div className="space-y-1 text-xs text-gray-300">
                  {candidate.applicant?.email && <div>Email: {candidate.applicant.email}</div>}
                  {candidate.applicant?.phone && <div>Phone: {candidate.applicant.phone}</div>}
                  {candidate.jobMatchScore && <div>Match Score: {candidate.jobMatchScore}%</div>}
                  {candidate.tags && candidate.tags.length > 0 && (
                    <div>Tags: {candidate.tags.join(', ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {shareStatus && <div className="text-xs text-emerald-400">{shareStatus}</div>}
          <div className="text-xs text-gray-400">{total} candidate{total > 1 ? 's' : ''} selected.</div>
        </div>
      );
    }

    if (isChooser) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">More Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => onNavigate('priority', context)}
              className="w-full px-3 py-2 bg-amber-600/20 border border-amber-500/30 text-amber-200 rounded-lg text-sm flex items-center justify-between"
            >
              Set Priority
              <MoveRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('tag', context)}
              className="w-full px-3 py-2 bg-pink-600/20 border border-pink-500/30 text-pink-200 rounded-lg text-sm flex items-center justify-between"
            >
              Manage Tags
              <Tag className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('note', context)}
              className="w-full px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-200 rounded-lg text-sm flex items-center justify-between"
            >
              Add Note
              <NotebookPen className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    if (type === 'move') {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Move Candidates</h3>
            <p className="text-sm text-gray-300">Select the workflow stage to move the selected candidates into.</p>
          </div>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            {columns.map(column => (
              <option key={column.id} value={column.id}>{column.name}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === 'note') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Add Note</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record feedback, interview outcomes, or context for your team"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[120px]"
          />
        </div>
      );
    }

    if (type === 'priority') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Set Priority</h3>
          <div className="grid grid-cols-2 gap-3">
            {['urgent', 'high', 'normal', 'low'].map(value => (
              <button
                key={value}
                onClick={() => setPriority(value)}
                className={`px-3 py-2 rounded-lg border text-sm capitalize ${
                  priority === value ? 'border-amber-400 bg-amber-500/20 text-amber-200' : 'border-gray-600 text-gray-300'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'tag') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Manage Tags</h3>
          <p className="text-sm text-gray-300">Separate tags with commas. Existing tags will be replaced.</p>
          <textarea
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[100px]"
          />
        </div>
      );
    }

    return null;
  };

  const showFooter = !isNotice && !isChooser;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>

        {renderContent()}

        {showFooter && (
          <div className="mt-6 flex items-center justify-between gap-3">
            {isShare && shareStatus && (
              <span className="text-xs text-emerald-400">{shareStatus}</span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Close
              </button>
              {!isShare && (
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing || (type === 'note' && !note.trim())}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isProcessing
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isProcessing ? 'Working...' : 'Apply'}
                </button>
              )}
              {isShare && (
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Copy to Clipboard
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparePanel({ candidates, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-30 w-full max-w-2xl bg-gray-900/95 border border-gray-700/80 rounded-2xl shadow-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Candidate Comparator</h3>
          <p className="text-xs text-gray-400">Review {candidates.length} selected candidates side-by-side.</p>
        </div>
        <button
          onClick={() => candidates.forEach(candidate => onRemove(candidate))}
          className="text-xs text-gray-400 hover:text-gray-200"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map(candidate => (
          <div key={candidate.id} className="bg-gray-800/70 border border-gray-700/70 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white truncate">
                {candidate.applicant?.fullName || 'Unknown Candidate'}
              </h4>
              <button
                onClick={() => onRemove(candidate)}
                className="text-xs text-gray-500 hover:text-gray-200"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>
                <span className="text-gray-500">Match Score</span>
                <div className="text-white font-semibold">{candidate.jobMatchScore ?? 0}%</div>
              </div>
              <div>
                <span className="text-gray-500">Stage</span>
                <div className="text-white font-semibold capitalize">{candidate.stage.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <span className="text-gray-500">Priority</span>
                <div className="text-white font-semibold capitalize">{candidate.priority || 'normal'}</div>
              </div>
              <div>
                <span className="text-gray-500">Applied</span>
                <div className="text-white font-semibold">{candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Unknown'}</div>
              </div>
            </div>
            {candidate.applicant?.skills && candidate.applicant.skills.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-gray-500 uppercase">Top Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {candidate.applicant.skills.slice(0, 5).map(skill => (
                    <span key={skill} className="px-2 py-1 text-[11px] bg-blue-600/20 text-blue-200 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Workspace Analytics Component
function WorkspaceAnalytics({ applications, columns }) {
  const totalApplications = applications.length;
  const conversionRates = {
    reviewRate: totalApplications > 0 ? Math.round((applications.filter(a => a.stage !== 'new').length / totalApplications) * 100) : 0,
    interviewRate: totalApplications > 0 ? Math.round((applications.filter(a => ['technical_interview', 'final_interview'].includes(a.stage)).length / totalApplications) * 100) : 0,
    hireRate: totalApplications > 0 ? Math.round((applications.filter(a => a.stage === 'hired').length / totalApplications) * 100) : 0
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-green-400" />
        Workspace Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{totalApplications}</div>
          <div className="text-gray-400 text-sm">Total Applications</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{conversionRates.reviewRate}%</div>
          <div className="text-gray-400 text-sm">Review Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{conversionRates.interviewRate}%</div>
          <div className="text-gray-400 text-sm">Interview Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{conversionRates.hireRate}%</div>
          <div className="text-gray-400 text-sm">Hire Rate</div>
        </div>
      </div>
      
      {/* Stage Distribution */}
      <div className="mt-8">
        <h4 className="text-white font-medium mb-4">Pipeline Distribution</h4>
        <div className="space-y-3">
          {columns.map((column) => {
            const count = applications.filter(app => app.stage === column.id).length;
            const percentage = totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
            
            return (
              <div key={column.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <span className="text-gray-300">{column.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{count} candidates</span>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${column.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-white w-8 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
