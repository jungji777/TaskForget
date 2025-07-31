import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { CreateWorkspaceForm } from '../../types';
import { clsx } from 'clsx';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const workspaceColors = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
];

const workspaceIcons = [
  '🏠', '🏢', '💼', '🎯', '🚀', '⭐', '🔥', '💡', '🎨', '📊',
  '🛠️', '📱', '💻', '🌟', '🎪', '🎭', '🎪', '🎨', '🎯', '🚀'
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createWorkspace, isLoading } = useWorkspaceStore();
  const [formData, setFormData] = useState<CreateWorkspaceForm>({
    name: '',
    description: '',
    color: workspaceColors[0],
    icon: workspaceIcons[0],
    isPublic: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createWorkspace(formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        color: workspaceColors[0],
        icon: workspaceIcons[0],
        isPublic: false,
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handleInputChange = (field: keyof CreateWorkspaceForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Workspace</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Workspace Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={clsx(
                'input-field',
                errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter workspace name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-field resize-none"
              placeholder="Describe your workspace (optional)"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-10 gap-2">
              {workspaceIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange('icon', icon)}
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors',
                    formData.icon === icon
                      ? 'bg-primary-100 ring-2 ring-primary-500'
                      : 'hover:bg-gray-100'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Color
            </label>
            <div className="grid grid-cols-10 gap-2">
              {workspaceColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={clsx(
                    'w-8 h-8 rounded-lg transition-all',
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this workspace public
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Public workspaces can be discovered and joined by anyone in your organization
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {formData.name || 'Workspace Name'}
                </p>
                <p className="text-sm text-gray-500">
                  {formData.description || 'No description'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};