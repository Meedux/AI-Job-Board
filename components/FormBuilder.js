'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  CheckSquare,
  ToggleLeft,
  List,
  Save,
  Eye,
  Settings,
  X,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  FILE: 'file'
};

const FIELD_ICONS = {
  [FIELD_TYPES.TEXT]: Type,
  [FIELD_TYPES.EMAIL]: Mail,
  [FIELD_TYPES.PHONE]: Phone,
  [FIELD_TYPES.DATE]: Calendar,
  [FIELD_TYPES.TEXTAREA]: FileText,
  [FIELD_TYPES.SELECT]: List,
  [FIELD_TYPES.CHECKBOX]: CheckSquare,
  [FIELD_TYPES.RADIO]: ToggleLeft,
  [FIELD_TYPES.FILE]: FileText
};

const FIELD_TYPE_LABELS = {
  [FIELD_TYPES.TEXT]: 'Text Input',
  [FIELD_TYPES.EMAIL]: 'Email Input',
  [FIELD_TYPES.PHONE]: 'Phone Number',
  [FIELD_TYPES.DATE]: 'Date Picker',
  [FIELD_TYPES.TEXTAREA]: 'Text Area',
  [FIELD_TYPES.SELECT]: 'Dropdown',
  [FIELD_TYPES.CHECKBOX]: 'Checkbox',
  [FIELD_TYPES.RADIO]: 'Radio Button',
  [FIELD_TYPES.FILE]: 'File Upload'
};

const FormBuilder = ({ onSave, onPreview, initialForm = null, jobId }) => {
  const [formFields, setFormFields] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showFieldTypeSelector, setShowFieldTypeSelector] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialForm) {
      setFormFields(initialForm.fields || []);
      setFormTitle(initialForm.title || '');
      setFormDescription(initialForm.description || '');
    } else {
      // Add default fields for job applications
      const defaultFields = [
        {
          id: 'full_name',
          type: FIELD_TYPES.TEXT,
          label: 'Full Name',
          placeholder: 'Enter your full name',
          required: true,
          validation: { minLength: 2 }
        },
        {
          id: 'email',
          type: FIELD_TYPES.EMAIL,
          label: 'Email Address',
          placeholder: 'Enter your email',
          required: true,
          validation: { pattern: 'email' }
        },
        {
          id: 'phone',
          type: FIELD_TYPES.PHONE,
          label: 'Phone Number',
          placeholder: 'Enter your phone number',
          required: true,
          validation: { pattern: 'phone' }
        },
        {
          id: 'resume',
          type: FIELD_TYPES.FILE,
          label: 'Resume/CV',
          required: true,
          validation: { fileTypes: ['.pdf', '.doc', '.docx'] }
        }
      ];
      setFormFields(defaultFields);
      setFormTitle('Job Application Form');
      setFormDescription('Please fill out this form to apply for the position.');
    }
  }, [initialForm]);

  const handleDragStart = useCallback((event) => {
    console.log('Drag started:', event);
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    console.log('Drag end event:', event);
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        console.log(`Moving item from index ${oldIndex} to ${newIndex}`);
        const newItems = arrayMove(items, oldIndex, newIndex);
        console.log('New field order:', newItems.map(f => f.label));
        return newItems;
      });
    }

    setActiveId(null);
  }, []);

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: FIELD_TYPE_LABELS[type],
      placeholder: '',
      required: false,
      validation: {},
      options: type === FIELD_TYPES.SELECT || type === FIELD_TYPES.RADIO || type === FIELD_TYPES.CHECKBOX ? ['Option 1'] : undefined
    };

    setFormFields([...formFields, newField]);
    setSelectedField(newField);
    setShowFieldEditor(true);
    setShowFieldTypeSelector(false);
  };

  const duplicateField = (field) => {
    const newField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (fieldId, updates) => {
    setFormFields(fields => 
      fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (fieldId) => {
    setFormFields(fields => fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      setShowFieldEditor(false);
    }
  };

  const moveField = (fieldId, direction) => {
    const currentIndex = formFields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) {
      console.log('Field not found for moving');
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= formFields.length) {
      console.log('Cannot move field, would be out of bounds');
      return;
    }

    console.log(`Moving field ${fieldId} ${direction} from index ${currentIndex} to ${newIndex}`);

    const newFields = [...formFields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    setFormFields(newFields);
  };

  const handleSave = async () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      fields: formFields,
      jobId
    };

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  // SortableFormField component
  const SortableFormField = ({ field, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:shadow-xl ${
          selectedField?.id === field.id 
            ? 'border-blue-500 shadow-blue-500/20 shadow-lg scale-[1.02]' 
            : isDragging 
              ? 'border-blue-400 shadow-blue-400/30 shadow-xl scale-105 z-50 opacity-90' 
              : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        {/* Field Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              {...attributes}
              {...listeners}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical size={16} />
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-md">
                {FIELD_ICONS[field.type] && 
                  React.createElement(FIELD_ICONS[field.type], { size: 16, className: "text-white" })
                }
              </div>
              <div>
                <span className="text-white font-semibold">{field.label}</span>
                {field.required && <span className="ml-2 text-red-400 text-sm font-medium">*Required</span>}
                <div className="text-xs text-gray-400 capitalize">{FIELD_TYPE_LABELS[field.type]}</div>
              </div>
            </div>
          </div>
          
          {/* Field Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={() => moveField(field.id, 'up')}
              disabled={index === 0}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => moveField(field.id, 'down')}
              disabled={index === formFields.length - 1}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() => duplicateField(field)}
              className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-all duration-200"
              title="Duplicate field"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => {
                setSelectedField(field);
                setShowFieldEditor(true);
              }}
              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-all duration-200"
              title="Edit field"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={() => deleteField(field.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all duration-200"
              title="Delete field"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {/* Field Preview */}
        <FormFieldPreview field={field} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Form Builder</h1>
                <p className="text-sm text-gray-400">Design your custom application form</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPreview({ title: formTitle, description: formDescription, fields: formFields })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 transform shadow-md"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 transform shadow-lg"
              >
                <Save size={16} />
                Save Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            {/* Form Header */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Form Configuration</span>
              </div>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent text-white border-none outline-none placeholder-gray-400 mb-3 focus:text-blue-300 transition-colors duration-300"
                placeholder="Enter form title..."
              />
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-transparent text-gray-300 border-none outline-none resize-none placeholder-gray-400 focus:text-blue-300 transition-colors duration-300"
                placeholder="Enter form description..."
                rows={2}
              />
            </div>

            {/* Form Fields */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={formFields.map(field => field.id)} strategy={verticalListSortingStrategy}>
                <div className={`min-h-[100px] space-y-4 transition-all duration-300 ${
                  activeId ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-xl p-4' : ''
                }`}>
                  {formFields.length > 0 ? (
                    formFields.map((field, index) => (
                      <SortableFormField
                        key={field.id}
                        field={field}
                        index={index}
                        selectedField={selectedField}
                        moveField={moveField}
                        duplicateField={duplicateField}
                        deleteField={deleteField}
                        setSelectedField={setSelectedField}
                        setShowFieldEditor={setShowFieldEditor}
                        formFields={formFields}
                      />
                    ))
                  ) : (
                    /* Empty State */
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No fields yet</h3>
                      <p className="text-gray-500">Add your first field to get started</p>
                    </div>
                  )}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="bg-gray-800 rounded-xl p-6 border border-blue-400 shadow-xl opacity-90">
                    <div className="flex items-center gap-3">
                      <GripVertical size={16} className="text-gray-400" />
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          {(() => {
                            const field = formFields.find(f => f.id === activeId);
                            const Icon = field ? FIELD_ICONS[field.type] : FileText;
                            return <Icon size={16} className="text-white" />;
                          })()}
                        </div>
                        <span className="text-white font-semibold">
                          {formFields.find(f => f.id === activeId)?.label || 'Field'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add Field Button */}
            <div className="mt-8">
              <button
                onClick={() => setShowFieldTypeSelector(!showFieldTypeSelector)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] transform shadow-lg"
              >
                <Plus className={`w-5 h-5 transition-transform duration-300 ${showFieldTypeSelector ? 'rotate-45' : ''}`} />
                <span className="font-medium">Add New Field</span>
                {showFieldTypeSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {/* Field Type Selector */}
              {showFieldTypeSelector && (
                <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-xl transform animate-in slide-in-from-top duration-300">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Choose Field Type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(FIELD_TYPES).map(([key, type]) => {
                      const Icon = FIELD_ICONS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => addField(type)}
                          className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-blue-600 rounded-lg text-white transition-all duration-200 hover:scale-105 transform shadow-md"
                        >
                          <Icon size={16} />
                          <span className="text-sm font-medium">{FIELD_TYPE_LABELS[type]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Form Stats */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700 shadow-lg">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  Form Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Fields</span>
                    <span className="text-white font-medium bg-blue-600/20 px-2 py-1 rounded text-sm">{formFields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Required Fields</span>
                    <span className="text-white font-medium bg-red-600/20 px-2 py-1 rounded text-sm">{formFields.filter(f => f.required).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Optional Fields</span>
                    <span className="text-white font-medium bg-green-600/20 px-2 py-1 rounded text-sm">{formFields.filter(f => !f.required).length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Quick Tips
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Drag and drop fields to reorder them</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Click the settings icon to customize field properties</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Use the copy button to duplicate fields</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Preview your form before saving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {showFieldEditor && selectedField && (
        <FieldEditor
          field={selectedField}
          onUpdate={(updates) => updateField(selectedField.id, updates)}
          onClose={() => {
            setShowFieldEditor(false);
            setSelectedField(null);
          }}
        />
      )}
    </div>
  );
};

// Field Preview Component
const FormFieldPreview = ({ field }) => {
  const renderField = () => {
    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.EMAIL:
      case FIELD_TYPES.PHONE:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-300"
            disabled
          />
        );

      case FIELD_TYPES.TEXTAREA:
        return (
          <textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors duration-300"
            disabled
          />
        );

      case FIELD_TYPES.SELECT:
        return (
          <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-300" disabled>
            <option>Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case FIELD_TYPES.CHECKBOX:
        return (
          <div className="space-y-3">
            {(field.options || ['Option 1']).map((option, index) => (
              <label key={index} className="flex items-center gap-3 text-white hover:text-blue-300 transition-colors cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case FIELD_TYPES.RADIO:
        return (
          <div className="space-y-3">
            {(field.options || ['Option 1']).map((option, index) => (
              <label key={index} className="flex items-center gap-3 text-white hover:text-blue-300 transition-colors cursor-pointer">
                <input type="radio" name={field.id} className="w-4 h-4 text-blue-600 focus:ring-blue-500" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case FIELD_TYPES.DATE:
        return (
          <input
            type="date"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
            disabled
          />
        );

      case FIELD_TYPES.FILE:
        return (
          <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 border-dashed rounded-lg text-gray-400 transition-colors duration-300 hover:border-blue-500">
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Choose file or drag and drop</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="mt-2">{renderField()}</div>;
};

// Field Editor Component
const FieldEditor = ({ field, onUpdate, onClose }) => {
  const [localField, setLocalField] = useState({ ...field });

  useEffect(() => {
    setLocalField({ ...field });
  }, [field]);

  const handleSave = () => {
    onUpdate(localField);
    onClose();
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...(localField.options || [])];
    newOptions[index] = value;
    setLocalField({ ...localField, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(localField.options || []), 'New Option'];
    setLocalField({ ...localField, options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = localField.options?.filter((_, i) => i !== index) || [];
    setLocalField({ ...localField, options: newOptions });
  };

  const hasOptions = [FIELD_TYPES.SELECT, FIELD_TYPES.CHECKBOX, FIELD_TYPES.RADIO].includes(field.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              {FIELD_ICONS[field.type] && 
                React.createElement(FIELD_ICONS[field.type], { size: 16, className: "text-white" })
              }
            </div>
            <div>
              <h3 className="text-white font-semibold">Edit Field</h3>
              <p className="text-sm text-gray-400">{FIELD_TYPE_LABELS[field.type]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Field Label
            </label>
            <input
              type="text"
              value={localField.label}
              onChange={(e) => setLocalField({ ...localField, label: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
              placeholder="Enter field label..."
            />
          </div>

          {field.type !== FIELD_TYPES.FILE && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Placeholder Text
              </label>
              <input
                type="text"
                value={localField.placeholder || ''}
                onChange={(e) => setLocalField({ ...localField, placeholder: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
                placeholder="Enter placeholder text..."
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-3 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={localField.required || false}
                onChange={(e) => setLocalField({ ...localField, required: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Required field</span>
            </label>
          </div>

          {hasOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Options
              </label>
              <div className="space-y-3">
                {(localField.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Option
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;