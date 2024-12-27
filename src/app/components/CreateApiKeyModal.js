"use client";

import { useState } from 'react';

export const CreateApiKeyModal = ({
  isOpen,
  isCreating,
  onClose,
  onSubmit
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyMaxUsage, setNewKeyMaxUsage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newKeyName, parseInt(newKeyMaxUsage));
    // Reset form
    setNewKeyName('');
    setNewKeyMaxUsage('');
  };

  const handleClose = () => {
    // Reset form and close modal
    setNewKeyName('');
    setNewKeyMaxUsage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">Create API Key</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="keyName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Key Name
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter key name"
                required
                aria-label="API Key Name"
              />
            </div>
            <div>
              <label 
                htmlFor="maxUsage" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Usage Limit
              </label>
              <input
                type="number"
                id="maxUsage"
                value={newKeyMaxUsage}
                onChange={(e) => setNewKeyMaxUsage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter max usage limit"
                min="1"
                required
                aria-label="Maximum Usage Limit"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum number of times this API key can be used
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              aria-label="Cancel creating API key"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              aria-label="Create API key"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                'Create Key'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 