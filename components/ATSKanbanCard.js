// ATS Kanban Dashboard Component
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
import {
  Users,
  Calendar,
  FileText,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Video,
  Phone,
  MapPin,
  Mail,
  User,
  Briefcase,
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Download,
  Send,
  Award,
  Target,
  Activity,
  Ban,
  Shield,
  UserCheck,
  Settings,
  MoreVertical,
  Share2,
  Copy,
  Bell,
  Flag,
  Heart,
  Archive,
  RefreshCw
} from 'lucide-react';

// ATS Kanban Stages
const ATS_STAGES = [
  { 
    id: 'new', 
    title: 'New Applications', 
    color: 'bg-blue-500',
    description: 'Newly received applications'
  },
  { 
    id: 'reviewing', 
    title: 'Under Review', 
    color: 'bg-yellow-500',
    description: 'Applications being reviewed'
  },
  { 
    id: 'shortlisted', 
    title: 'Shortlisted', 
    color: 'bg-green-500',
    description: 'Qualified candidates'
  },
  { 
    id: 'interview_scheduled', 
    title: 'Interview Scheduled', 
    color: 'bg-purple-500',
    description: 'Interviews scheduled'
  },
  { 
    id: 'interview_completed', 
    title: 'Interview Completed', 
    color: 'bg-indigo-500',
    description: 'Completed interviews'
  },
  { 
    id: 'final_review', 
    title: 'Final Review', 
    color: 'bg-orange-500',
    description: 'Final selection process'
  },
  { 
    id: 'offered', 
    title: 'Offer Extended', 
    color: 'bg-emerald-500',
    description: 'Job offer sent'
  },
  { 
    id: 'hired', 
    title: 'Hired', 
    color: 'bg-green-600',
    description: 'Successfully hired'
  },
  { 
    id: 'rejected', 
    title: 'Rejected', 
    color: 'bg-red-500',
    description: 'Not selected'
  },
  { 
    id: 'on_hold', 
    title: 'On Hold', 
    color: 'bg-gray-500',
    description: 'Applications on hold'
  },
  { 
    id: 'watchlist', 
    title: 'Watchlist', 
    color: 'bg-red-600',
    description: 'Blocked/flagged applicants'
  }
];

// User Role Permissions
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
          canViewContactDetails: false, // Unless allowed by admin
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
      } else if (userType === 'vendor') {
        return {
          canViewContactDetails: false,
          canHideContactDetails: false,
          canViewResumes: false,
          canMakeNotes: false,
          canAssignStars: false,
          canSendInvites: false,
          canScheduleInterviews: false,
          canSelectMultiple: false,
          canShareResumes: true, // Can send/forward resumes
          canSearchDatabase: false,
          canBlockApplicants: false,
          canManageUsers: false,
          canPurchaseCredits: false,
          hasFullControl: false
        };
      } else if (userType === 'customer') {
        return {
          canViewContactDetails: false, // Unless allowed by admin
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
      return {
        canViewContactDetails: false,
        canHideContactDetails: false,
        canViewResumes: false,
        canMakeNotes: false,
        canAssignStars: false,
        canSendInvites: false,
        canScheduleInterviews: false,
        canSelectMultiple: false,
        canShareResumes: false,
        canSearchDatabase: false,
        canBlockApplicants: false,
        canManageUsers: false,
        canPurchaseCredits: false,
        hasFullControl: false
      };
  }
  return {};
};

// Resume Card Component for Kanban
const ResumeCard = ({ candidate, permissions, onCardClick, onStatusChange, onStarRating, onToggleContactVisibility }) => {
  const [showActions, setShowActions] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [starRating, setStarRating] = useState(candidate.rating || 0);
  const [isSelected, setIsSelected] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStarClick = (rating) => {
    if (permissions.canAssignStars) {
      setStarRating(rating);
      onStarRating(candidate.id, rating);
    }
  };

  const toggleContactVisibility = () => {
    if (permissions.canHideContactDetails) {
      setIsContactVisible(!isContactVisible);
      onToggleContactVisibility(candidate.id, !isContactVisible);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 p-4 mb-3 cursor-move ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isDragging ? 'scale-105' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {permissions.canSelectMultiple && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => setIsSelected(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          <div className="flex-1">
            {/* Name Display with Visibility Toggle */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {(permissions.canViewContactDetails || isContactVisible) ? 
                  candidate.name : 
                  `Candidate ${candidate.id.slice(-4)}`
                }
              </h3>
              
              {permissions.canHideContactDetails && (
                <button
                  onClick={toggleContactVisibility}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isContactVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              )}
            </div>
            
            <p className="text-sm text-gray-600">{candidate.position}</p>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg z-10 py-1 w-48">
              {permissions.canViewResumes && (
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <FileText size={14} />
                  View Resume
                </button>
              )}
              
              {permissions.canSendInvites && (
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Send size={14} />
                  Send Invite
                </button>
              )}
              
              {permissions.canScheduleInterviews && (
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Calendar size={14} />
                  Schedule Interview
                </button>
              )}
              
              {permissions.canShareResumes && (
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Share2 size={14} />
                  Share Resume
                </button>
              )}
              
              {permissions.canBlockApplicants && (
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                  <Ban size={14} />
                  Block Applicant
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      {(permissions.canViewContactDetails || isContactVisible) && (
        <div className="space-y-1 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail size={12} />
            <span>{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={12} />
            <span>{candidate.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            <span>{candidate.location}</span>
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {candidate.skills?.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {skill}
            </span>
          ))}
          {candidate.skills?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Star Rating */}
      {permissions.canAssignStars && (
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              className="text-yellow-400 hover:text-yellow-500"
            >
              <Star
                size={14}
                fill={star <= starRating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
      )}

      {/* Notes and Tags */}
      <div className="space-y-2">
        {candidate.notes && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <MessageSquare size={12} className="inline mr-1" />
            {candidate.notes}
          </div>
        )}
        
        {candidate.tags && (
          <div className="flex flex-wrap gap-1">
            {candidate.tags.map((tag, index) => (
              <span key={index} className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Applied {candidate.appliedDate}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {candidate.hasDocument && <FileText size={12} className="text-gray-400" />}
          {candidate.isUrgent && <Flag size={12} className="text-red-500" />}
          {candidate.isFavorite && <Heart size={12} className="text-red-500" />}
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
