'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, Settings, Users, Lock, Unlock, Edit3, Trash2, 
  MoreVertical, Grid, List, Calendar, Filter, Search,
  Download, Share2, BookOpen, Tag, Bell, Eye, 
  ChevronDown, ChevronRight, BarChart3, Target,
  Sparkles, Brain, Zap, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import ATSKanbanCard from './ATSKanbanCard';

// Default workspace columns
const DEFAULT_COLUMNS = [
  { 
    id: 'new_inbox', 
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

export default function EnhancedATSWorkspace({ workspaceId }) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [applications, setApplications] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list'
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterBy, setFilterBy] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: 'Main Hiring Workspace',
    description: 'Primary workspace for all hiring activities',
    isPublic: false,
    maxCollaborators: 5,
    currentCollaborators: 3
  });

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

  const handleCardDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;
    
    // Update application stage
    setApplications(prev =>
      prev.map(app =>
        app.id.toString() === draggableId
          ? { ...app, stage: destination.droppableId }
          : app
      )
    );
  };

  const getApplicationsByColumn = (columnId) => {
    return applications.filter(app => app.stage === columnId);
  };

  const getColumnStats = (columnId) => {
    const apps = getApplicationsByColumn(columnId);
    return {
      total: apps.length,
      new: apps.filter(app => app.isNew).length,
      urgent: apps.filter(app => app.priority === 'urgent').length,
      overdue: apps.filter(app => app.isOverdue).length
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
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
                <WorkspaceAnalytics applications={applications} columns={columns} />
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
                
                <div className="flex gap-3">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">All Applications</option>
                    <option value="new">New Applications</option>
                    <option value="urgent">Urgent Priority</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  
                  <button className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </button>
                  
                  <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Kanban Board */}
          {viewMode === 'kanban' && (
            <DragDropContext onDragEnd={handleCardDragEnd}>
              <div className="overflow-x-auto">
                <div className="flex gap-6 pb-6 min-w-fit">
                  {columns.map((column, index) => (
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
                              {getApplicationsByColumn(column.id).map((application, index) => (
                                <ATSKanbanCard
                                  key={application.id}
                                  candidate={application}
                                  index={index}
                                />
                              ))}
                            </AnimatePresence>
                            {provided.placeholder}
                            
                            {getApplicationsByColumn(column.id).length === 0 && (
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
                  ))}
                </div>
              </div>
            </DragDropContext>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                >
                  {/* List view content - simplified version of kanban card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {application.applicant?.firstName?.[0]}{application.applicant?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{application.applicant?.fullName}</h3>
                        <p className="text-gray-400">{application.applicant?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        columns.find(col => col.id === application.stage)?.color || 'bg-gray-600'
                      }`}>
                        {columns.find(col => col.id === application.stage)?.name || 'Unknown Stage'}
                      </span>
                      
                      <button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-all duration-300">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Column Header Component
function ColumnHeader({ column, stats, isManaging, onUpdate, onDelete }) {
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

// Workspace Analytics Component
function WorkspaceAnalytics({ applications, columns }) {
  const totalApplications = applications.length;
  const conversionRates = {
    reviewRate: totalApplications > 0 ? Math.round((applications.filter(a => a.stage !== 'new_inbox').length / totalApplications) * 100) : 0,
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
