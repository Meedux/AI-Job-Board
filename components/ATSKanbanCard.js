'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

export default function ATSKanbanCard({ candidate, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-white text-lg">
                {candidate.applicant?.fullName || 'Unknown Candidate'}
              </h4>
              <p className="text-gray-400 text-sm">
                {candidate.applicant?.email || 'No email'}
              </p>
            </div>
            
            {candidate.isFavorite && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-yellow-400 ml-2"
              >
                ⭐
              </motion.div>
            )}
          </div>

          {/* Rating */}
          {candidate.rating && (
            <div className="flex items-center mb-2">
              <span className="text-yellow-400 text-sm">
                {getRatingStars(candidate.rating)}
              </span>
              <span className="text-gray-400 text-xs ml-2">
                ({candidate.rating}/5)
              </span>
            </div>
          )}

          {/* Tags */}
          {candidate.tags && candidate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {candidate.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stage Badge */}
          <div className="flex items-center justify-between">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium text-white
              ${getStageColor(candidate.stage)}
            `}>
              {candidate.stage?.replace('_', ' ').toUpperCase()}
            </span>
            
            <span className="text-gray-500 text-xs">
              {candidate.source ? `via ${candidate.source}` : ''}
            </span>
          </div>

          {/* Expanded Details */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            className="overflow-hidden"
          >
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                {/* Skills */}
                {candidate.applicant?.skills && (
                  <div className="mb-3">
                    <h5 className="text-gray-300 text-sm font-medium mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-1">
                      {candidate.applicant.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {candidate.applicant?.location && (
                  <div className="mb-3">
                    <span className="text-gray-400 text-sm">📍 {candidate.applicant.location}</span>
                  </div>
                )}

                {/* Notes */}
                {candidate.notes && (
                  <div className="mb-3">
                    <h5 className="text-gray-300 text-sm font-medium mb-1">Notes</h5>
                    <p className="text-gray-400 text-sm">{candidate.notes}</p>
                  </div>
                )}

                {/* Cover Letter Preview */}
                {candidate.coverLetter && (
                  <div className="mb-3">
                    <h5 className="text-gray-300 text-sm font-medium mb-1">Cover Letter</h5>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {candidate.coverLetter}
                    </p>
                  </div>
                )}

                {/* Resume Link */}
                {candidate.applicant?.resumeUrl && (
                  <div className="mt-3">
                    <a
                      href={candidate.applicant.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 
                               text-white text-sm rounded transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📄 View Resume
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Applied Date */}
          <div className="mt-3 text-gray-500 text-xs">
            Applied: {new Date(candidate.createdAt).toLocaleDateString()}
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
