// ATS Kanban Dashboard - Main Component
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ResumeCard from './ATSKanbanCard';
import {
  Users,
  Calendar,
  FileText,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Download,
  Settings,
  Bell,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  TrendingUp,
  Database,
  Upload,
  Share2,
  Archive,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  UserPlus,
  Zap
} from 'lucide-react';

// ATS Stages Configuration
const ATS_STAGES = [
  { 
    id: 'new', 
    title: 'New Applications', 
    color: 'bg-blue-500',
    description: 'Newly received applications',
    icon: <FileText size={16} />
  },
  { 
    id: 'reviewing', 
    title: 'Under Review', 
    color: 'bg-yellow-500',
    description: 'Applications being reviewed',
    icon: <Eye size={16} />
  },
  { 
    id: 'shortlisted', 
    title: 'Shortlisted', 
    color: 'bg-green-500',
    description: 'Qualified candidates',
    icon: <CheckCircle size={16} />
  },
  { 
    id: 'interview_scheduled', 
    title: 'Interview Scheduled', 
    color: 'bg-purple-500',
    description: 'Interviews scheduled',
    icon: <Calendar size={16} />
  },
  { 
    id: 'interview_completed', 
    title: 'Interview Completed', 
    color: 'bg-indigo-500',
    description: 'Completed interviews',
    icon: <CheckCircle size={16} />
  },
  { 
    id: 'final_review', 
    title: 'Final Review', 
    color: 'bg-orange-500',
    description: 'Final selection process',
    icon: <Target size={16} />
  },
  { 
    id: 'offered', 
    title: 'Offer Extended', 
    color: 'bg-emerald-500',
    description: 'Job offer sent',
    icon: <Award size={16} />
  },
  { 
    id: 'hired', 
    title: 'Hired', 
    color: 'bg-green-600',
    description: 'Successfully hired',
    icon: <UserPlus size={16} />
  },
  { 
    id: 'rejected', 
    title: 'Rejected', 
    color: 'bg-red-500',
    description: 'Not selected',
    icon: <AlertCircle size={16} />
  },
  { 
    id: 'on_hold', 
    title: 'On Hold', 
    color: 'bg-gray-500',
    description: 'Applications on hold',
    icon: <Clock size={16} />
  },
  { 
    id: 'watchlist', 
    title: 'Watchlist', 
    color: 'bg-red-600',
    description: 'Blocked/flagged applicants',
    icon: <AlertCircle size={16} />
  }
];

// Kanban Column Component
const KanbanColumn = ({ stage, candidates, permissions, onCandidateUpdate, onStageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const candidateCount = candidates.length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: stage.id,
    data: {
      type: 'container',
      stage,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 rounded-lg p-4 min-w-80 max-w-80 flex flex-col"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
          <div className="flex items-center gap-2">
            {stage.icon}
            <h3 className="font-semibold text-gray-900">{stage.title}</h3>
          </div>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {candidateCount}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
          
          <button className="text-gray-400 hover:text-gray-600">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Column Description */}
      <p className="text-xs text-gray-500 mb-4">{stage.description}</p>

      {/* Cards Container */}
      {!isCollapsed && (
        <div className="flex-1 min-h-96">
          <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <ResumeCard
                  key={candidate.id}
                  candidate={candidate}
                  permissions={permissions}
                  onCardClick={(id) => console.log('Card clicked:', id)}
                  onStatusChange={onStageChange}
                  onStarRating={onCandidateUpdate}
                  onToggleContactVisibility={onCandidateUpdate}
                />
              ))}
            </div>
          </SortableContext>
          
          {candidates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <FileText size={32} className="mb-2" />
              <p className="text-sm">No candidates</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main ATS Kanban Dashboard
const ATSKanbanDashboard = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    experience: '',
    skills: [],
    location: '',
    rating: 0
  });
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get user permissions based on role and type
  const getUserPermissions = (userRole, userType) => {
    switch (userRole) {
      case 'employer_admin':
        return {
          canViewContactDetails: true,
          canHideContactDetails: true,
          canViewResumes: true,
          canMakeNotes: true,
          canAssignStars: true,
          canSendInvites: true,
          canScheduleInterviews: true,
          canSelectMultiple: true,
          canShareResumes: true,
          canSearchDatabase: true,
          canBlockApplicants: true,
          canManageUsers: true,
          canPurchaseCredits: true,
          hasFullControl: true
        };
      case 'sub_user':
        if (userType === 'staff') {
          return {
            canViewContactDetails: true,
            canHideContactDetails: true,
            canViewResumes: true,
            canMakeNotes: true,
            canAssignStars: true,
            canSendInvites: true,
            canScheduleInterviews: true,
            canSelectMultiple: true,
            canShareResumes: true,
            canSearchDatabase: true,
            canBlockApplicants: true,
            canManageUsers: false,
            canPurchaseCredits: false,
            hasFullControl: false
          };
        } else if (userType === 'hiring_manager') {
          return {
            canViewContactDetails: false,
            canHideContactDetails: false,
            canViewResumes: true,
            canMakeNotes: true,
            canAssignStars: true,
            canSendInvites: false,
            canScheduleInterviews: true,
            canSelectMultiple: true,
            canShareResumes: false,
            canSearchDatabase: false,
            canBlockApplicants: false,
            canManageUsers: false,
            canPurchaseCredits: false,
            hasFullControl: false
          };
        }
        break;
      default:
        return {};
    }
    return {};
  };

  const permissions = getUserPermissions(user?.role, user?.userType);

  // Mock data for demonstration
  useEffect(() => {
    const mockCandidates = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        position: 'Senior Developer',
        location: 'Manila, Philippines',
        stage: 'new',
        rating: 4,
        skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
        appliedDate: '2 days ago',
        notes: 'Strong technical background, good communication skills',
        tags: ['High Priority', 'Remote OK'],
        hasDocument: true,
        isUrgent: false,
        isFavorite: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        position: 'UX Designer',
        location: 'Cebu, Philippines',
        stage: 'reviewing',
        rating: 5,
        skills: ['Figma', 'Adobe XD', 'User Research'],
        appliedDate: '1 day ago',
        notes: 'Excellent portfolio, creative thinking',
        tags: ['Top Talent'],
        hasDocument: true,
        isUrgent: true,
        isFavorite: false
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1234567892',
        position: 'Project Manager',
        location: 'Davao, Philippines',
        stage: 'shortlisted',
        rating: 3,
        skills: ['Agile', 'Scrum', 'JIRA', 'Leadership'],
        appliedDate: '3 days ago',
        notes: 'Good leadership experience, needs technical assessment',
        tags: ['Management'],
        hasDocument: true,
        isUrgent: false,
        isFavorite: false
      }
    ];

    setCandidates(mockCandidates);
    setFilteredCandidates(mockCandidates);
    setLoading(false);
  }, []);

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropping on a different stage
    if (active.data.current?.type === 'card' && over.data.current?.type === 'container') {
      const newStage = over.data.current.stage.id;
      
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === activeId 
            ? { ...candidate, stage: newStage }
            : candidate
        )
      );
    }
  };

  // Filter candidates by search and filters
  useEffect(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedFilters.rating > 0) {
      filtered = filtered.filter(candidate => candidate.rating >= selectedFilters.rating);
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchTerm, selectedFilters]);

  // Group candidates by stage
  const candidatesByStage = ATS_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredCandidates.filter(candidate => candidate.stage === stage.id);
    return acc;
  }, {});

  // Handle candidate updates
  const handleCandidateUpdate = (candidateId, updates) => {
    setCandidates(prev =>
      prev.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, ...updates }
          : candidate
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ATS Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ATS Dashboard</h1>
              <p className="text-gray-600">Applicant Tracking System - Kanban View</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'kanban' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {permissions.canSearchDatabase && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Database size={16} />
                    Search Database
                  </button>
                )}
                
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Upload size={16} />
                  Import
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-4">
          {ATS_STAGES.slice(0, 6).map((stage) => {
            const count = candidatesByStage[stage.id]?.length || 0;
            return (
              <div key={stage.id} className="text-center">
                <div className={`w-3 h-3 ${stage.color} rounded-full mx-auto mb-1`}></div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">{stage.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filters
            </button>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">All Jobs</option>
              <option value="senior-developer">Senior Developer</option>
              <option value="ux-designer">UX Designer</option>
              <option value="project-manager">Project Manager</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredCandidates.length} candidates
            </span>
            
            {selectedCandidates.length > 0 && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-blue-600">
                  {selectedCandidates.length} selected
                </span>
                
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Actions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6">
            {ATS_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                candidates={candidatesByStage[stage.id] || []}
                permissions={permissions}
                onCandidateUpdate={handleCandidateUpdate}
                onStageChange={(candidateId, newStage) => {
                  handleCandidateUpdate(candidateId, { stage: newStage });
                }}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default ATSKanbanDashboard;
