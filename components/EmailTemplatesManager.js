'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  RotateCcw, 
  Send, 
  Settings, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  Upload
} from 'lucide-react';

export default function EmailTemplatesManager() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [editForm, setEditForm] = useState({
    subject: '',
    content: '',
    enabled: true
  });

  const templateCategories = {
    application_status: { name: 'Application Status', icon: FileText, color: 'blue' },
    interview: { name: 'Interview', icon: Calendar, color: 'green' },
    offer: { name: 'Job Offers', icon: CheckCircle, color: 'purple' },
    rejection: { name: 'Rejections', icon: AlertCircle, color: 'gray' }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        if (data.length > 0 && !activeTemplate) {
          setActiveTemplate(data[0]);
          setEditForm({
            subject: data[0].customTemplate ? data[0].subject : data[0].subject,
            content: data[0].customTemplate || data[0].defaultTemplate,
            enabled: data[0].enabled ?? true
          });
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setActiveTemplate(template);
    setEditForm({
      subject: template.customTemplate ? template.subject : template.subject,
      content: template.customTemplate || template.defaultTemplate,
      enabled: template.enabled ?? true
    });
    setEditing(false);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/email-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          subject: editForm.subject,
          content: editForm.content,
          enabled: editForm.enabled
        })
      });

      if (response.ok) {
        await fetchTemplates();
        setEditing(false);
        // Show success message
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Are you sure you want to reset this template to default? Your customizations will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-templates?templateId=${activeTemplate.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        await fetchTemplates();
        setEditing(false);
      }
    } catch (error) {
      console.error('Error resetting template:', error);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editForm.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newContent = before + `{${variable}}` + after;
    
    setEditForm(prev => ({ ...prev, content: newContent }));
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length + 2;
      textarea.focus();
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Email Templates</h1>
          <p className="text-gray-400 mt-2">Customize automated emails sent to job applicants</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Templates
                </h2>
              </div>
              
              <div className="p-4 space-y-4">
                {Object.entries(templateCategories).map(([category, info]) => {
                  const categoryTemplates = templates.filter(t => t.category === category);
                  
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <info.icon className="w-4 h-4" />
                        {info.name}
                      </h3>
                      
                      <div className="space-y-1 ml-6">
                        {categoryTemplates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              activeTemplate?.id === template.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{template.name}</span>
                              {template.isCustomized && (
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-3">
            {activeTemplate && (
              <div className="space-y-6">
                {/* Template Header */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{activeTemplate.name}</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        Category: {templateCategories[activeTemplate.category]?.name}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-3 py-2 rounded flex items-center gap-2 text-sm ${
                          previewMode 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </button>
                      
                      {activeTemplate.isCustomized && (
                        <button
                          onClick={handleResetToDefault}
                          className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center gap-2 text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      activeTemplate.isCustomized 
                        ? 'bg-yellow-900 text-yellow-200' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {activeTemplate.isCustomized ? 'Customized' : 'Default'}
                    </span>
                    
                    <span className={`px-2 py-1 rounded ${
                      editForm.enabled 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {editForm.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {previewMode ? (
                  /* Preview Mode */
                  <div className="bg-gray-800 rounded-lg border border-gray-700">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">Email Preview</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="bg-white rounded-lg p-6 text-black">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                          <p className="text-sm text-gray-600">Subject:</p>
                          <p className="font-semibold">{editForm.subject}</p>
                        </div>
                        
                        <div 
                          dangerouslySetInnerHTML={{ __html: editForm.content }}
                          className="prose max-w-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div className="space-y-6">
                    {/* Subject Line */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="Email subject..."
                      />
                    </div>

                    {/* Content Editor */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Template Content</h3>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Variables Panel */}
                          <div className="lg:col-span-1">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Available Variables</h4>
                            <div className="space-y-2">
                              {activeTemplate.variables.map(variable => (
                                <button
                                  key={variable}
                                  onClick={() => insertVariable(variable)}
                                  className="w-full text-left px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 hover:text-white text-sm"
                                >
                                  {`{${variable}}`}
                                </button>
                              ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editForm.enabled}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, enabled: e.target.checked }))}
                                  className="rounded"
                                />
                                <span className="text-gray-300 text-sm">Enable Template</span>
                              </label>
                            </div>
                          </div>
                          
                          {/* Content Editor */}
                          <div className="lg:col-span-3">
                            <textarea
                              id="template-content"
                              value={editForm.content}
                              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                              className="w-full h-96 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm resize-none"
                              placeholder="Enter your email template content..."
                            />
                            
                            <div className="mt-4 text-sm text-gray-400">
                              <p>Tips:</p>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Use HTML for formatting</li>
                                <li>Click variables above to insert them</li>
                                <li>Variables will be replaced with actual values when emails are sent</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
