'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import ATSKanbanCard from './ATSKanbanCard';
import Header from './Header';

const KANBAN_STAGES = [
  { id: 'new', name: 'New Applications', color: 'bg-blue-600' },
  { id: 'reviewing', name: 'Under Review', color: 'bg-yellow-600' },
  { id: 'phone_screening', name: 'Phone Screening', color: 'bg-orange-600' },
  { id: 'technical_interview', name: 'Technical Interview', color: 'bg-purple-600' },
  { id: 'final_interview', name: 'Final Interview', color: 'bg-indigo-600' },
  { id: 'reference_check', name: 'Reference Check', color: 'bg-pink-600' },
  { id: 'offer_extended', name: 'Offer Extended', color: 'bg-green-600' },
  { id: 'offer_accepted', name: 'Offer Accepted', color: 'bg-emerald-600' },
  { id: 'onboarding', name: 'Onboarding', color: 'bg-teal-600' },
  { id: 'hired', name: 'Hired', color: 'bg-cyan-600' },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-600' }
];

export default function ATSKanbanDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState([]);

  // Fetch applications and jobs
  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs?include=applications');
      if (response.ok) {
        const data = await response.json();
        // Flatten applications from all jobs
        const allApplications = data.jobs?.flatMap(job => 
          job.applications?.map(app => ({
            ...app,
            job: { id: job.id, title: job.title }
          })) || []
        ) || [];
        setApplications(allApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId;
    const applicationId = parseInt(draggableId);

    // Optimistic update
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, stage: newStage }
          : app
      )
    );

    // Update backend
    try {
      await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
    } catch (error) {
      console.error('Error updating application stage:', error);
      // Revert optimistic update on error
      fetchApplications();
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJob === 'all' || app.job?.id === parseInt(selectedJob);
    return matchesSearch && matchesJob;
  });

  const getApplicationsByStage = (stage) => {
    return filteredApplications.filter(app => app.stage === stage);
  };

  const getStageStats = () => {
    return KANBAN_STAGES.reduce((acc, stage) => {
      acc[stage.id] = getApplicationsByStage(stage.id).length;
      return acc;
    }, {});
  };

  const stats = getStageStats();
  const totalApplications = Object.values(stats).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-300">Loading ATS Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-[3.5rem]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Applicant Tracking System
          </h1>
          <p className="text-gray-400">
            Manage your candidates through the hiring pipeline
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{totalApplications}</div>
            <div className="text-gray-400 text-sm">Total Applications</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.hired}</div>
            <div className="text-gray-400 text-sm">Hired</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.reviewing}</div>
            <div className="text-gray-400 text-sm">In Review</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{stats.technical_interview}</div>
            <div className="text-gray-400 text-sm">Interviewing</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.offer_extended}</div>
            <div className="text-gray-400 text-sm">Offers Extended</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-gray-400 text-sm">Rejected</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 text-sm mb-2">Search Candidates</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-300 text-sm mb-2">Filter by Job</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-6" style={{ minWidth: 'fit-content' }}>
              {KANBAN_STAGES.map((stage, stageIndex) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: stageIndex * 0.1 }}
                  className="w-80 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  {/* Column Header */}
                  <div className={`${stage.color} text-white px-4 py-3 rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{stage.name}</h3>
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                        {getApplicationsByStage(stage.id).length}
                      </span>
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-96 transition-colors duration-200 ${
                          snapshot.isDraggingOver ? 'bg-gray-700' : 'bg-gray-800'
                        }`}
                      >
                        <AnimatePresence>
                          {getApplicationsByStage(stage.id).map((application, index) => (
                            <ATSKanbanCard
                              key={application.id}
                              candidate={application}
                              index={index}
                            />
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                        
                        {getApplicationsByStage(stage.id).length === 0 && (
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

        {filteredApplications.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedJob !== 'all' 
                ? 'Try adjusting your search filters'
                : 'No job applications available yet'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
