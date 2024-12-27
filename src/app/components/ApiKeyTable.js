"use client";

import { useState } from 'react';
import { Eye, EyeOff, Clipboard, Pencil, Trash, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';

export const ApiKeyTable = ({ 
  apiKeys, 
  isLoading,
  sortOrder,
  onSort,
  onCopy,
  onEdit,
  onRegenerate,
  onDelete 
}) => {
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [editingKey, setEditingKey] = useState(null);
  const [editName, setEditName] = useState('');

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleEditSubmit = (e, key) => {
    e.preventDefault();
    onEdit({ ...key, name: editName });
    setEditingKey(null);
    setEditName('');
  };

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          'No API keys found. Create one to get started.'
        )}
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50 text-left">
        <tr>
          <th className="px-6 py-3">
            <button 
              onClick={onSort}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              NAME
              {sortOrder === 'asc' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </th>
          <th className="px-6 py-3 text-sm font-medium text-gray-500">USAGE</th>
          <th className="px-6 py-3 text-sm font-medium text-gray-500">KEY</th>
          <th className="px-6 py-3 text-sm font-medium text-gray-500">OPTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {apiKeys.map((key) => (
          <tr key={key.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              {editingKey?.id === key.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, key)} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    autoFocus
                    required
                  />
                  <div className="flex gap-1">
                    <button
                      type="submit"
                      className="px-2 py-1 bg-gray-900 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKey(null);
                        setEditName('');
                      }}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <span className="font-medium">{key.name}</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-col">
                <span className="text-sm">
                  {key.usage_count} / {key.max_usage}
                </span>
                <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                  <div 
                    className="h-full bg-gray-900 rounded-full"
                    style={{ 
                      width: `${Math.min((key.usage_count / key.max_usage) * 100, 100)}%`,
                      backgroundColor: key.usage_count >= key.max_usage ? '#ef4444' : undefined
                    }}
                  />
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">
                  {visibleKeys.has(key.id) ? key.value : `${key.value.slice(0, 12)}•••••••••••••••`}
                </code>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleKeyVisibility(key.id)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                  title={visibleKeys.has(key.id) ? "Hide API Key" : "Show API Key"}
                >
                  {visibleKeys.has(key.id) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onCopy(key.value)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                  title="Copy"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingKey(key);
                    setEditName(key.name);
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRegenerate(key.id)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                  title="Regenerate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(key.id)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                  title="Delete"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}; 