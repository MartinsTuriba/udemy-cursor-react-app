"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Clipboard, Pencil, Trash, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

const STATIC_USER_ID = 'dev-local';

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyMaxUsage, setNewKeyMaxUsage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editName, setEditName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', STATIC_USER_ID)
        .order('name', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err) {
      setError('Failed to fetch API keys');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [sortOrder]);

  // Create new API key
  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    const maxUsage = parseInt(newKeyMaxUsage);
    if (isNaN(maxUsage) || maxUsage <= 0) {
      toast.error('Please enter a valid max usage limit');
      return;
    }

    setIsCreating(true);
    try {
      const newKey = {
        name: newKeyName.trim(),
        value: `key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        user_id: STATIC_USER_ID,
        usage_count: 0,
        max_usage: maxUsage,
      };

      const { data, error } = await supabase
        .from('api_keys')
        .insert([newKey])
        .select()
        .single();

      if (error) throw error;

      setApiKeys([data, ...apiKeys]);
      setNewKeyName('');
      setNewKeyMaxUsage('');
      setShowCreateForm(false);
      toast.success('API key created successfully');
    } catch (err) {
      toast.error('Failed to create API key');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Updated regenerate handler with confirmation
  const handleRegenerateKey = async (id) => {
    const key = apiKeys.find(k => k.id === id);
    
    if (await showRegenerateConfirmation(key.name)) {
      try {
        const newValue = `key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        
        const { error } = await supabase
          .from('api_keys')
          .update({ value: newValue })
          .eq('id', id)
          .eq('user_id', STATIC_USER_ID);

        if (error) throw error;

        setApiKeys(prev => prev.map(key => 
          key.id === id ? { ...key, value: newValue } : key
        ));
        toast.success('API key regenerated successfully');
      } catch (err) {
        toast.error('Failed to regenerate API key');
        console.error(err);
      }
    }
  };

  // Delete API key
  const handleDeleteKey = async (id) => {
    const key = apiKeys.find(k => k.id === id);
    
    if (await showDeleteConfirmation(key.name)) {
      try {
        const { error } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', id)
          .eq('user_id', STATIC_USER_ID);

        if (error) throw error;
        
        setApiKeys(apiKeys.filter(key => key.id !== id));
        toast.success('API key deleted successfully');
      } catch (err) {
        toast.error('Failed to delete API key');
        console.error(err);
      }
    }
  };

  // Update API key name
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingKey) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ name: editName.trim() })
        .eq('id', editingKey.id)
        .eq('user_id', STATIC_USER_ID);

      if (error) throw error;

      setApiKeys(prev => prev.map(key => 
        key.id === editingKey.id ? { ...key, name: editName.trim() } : key
      ));
      setEditingKey(null);
      setEditName('');
    } catch (err) {
      setError('Failed to update API key');
      console.error(err);
    }
  };

  const handleEditKey = (key) => {
    setEditingKey(key);
    setEditName(key.name);
  };

  // Updated copy handler with toast notification
  const handleCopyKey = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('API key copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

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

  // Custom regenerate confirmation modal
  const showRegenerateConfirmation = (keyName) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 class="text-lg font-medium mb-4">Regenerate API Key</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to regenerate the API key "${keyName}"? The old key will stop working immediately.
            </p>
            <div class="flex justify-end gap-2">
              <button class="cancel-btn px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button class="confirm-btn px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">
                Regenerate
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector('.confirm-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');

      confirmBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });
    });
  };

  // Refactored showDeleteConfirmation to match the style
  const showDeleteConfirmation = (keyName) => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 class="text-lg font-medium mb-4">Delete API Key</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-2">
              <button class="cancel-btn px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button class="confirm-btn px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = modal.querySelector('.confirm-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');

      confirmBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });
    });
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="p-8">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Pages</span>
            <span>/</span>
            <span>Overview</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        </div>

        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6 flex justify-between items-center border-b">
            <h2 className="text-lg font-medium">API Keys</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
            >
              Create API Key
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3">
                    <button 
                      onClick={toggleSortOrder}
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
                        <form onSubmit={handleSaveEdit} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            autoFocus
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
                          onClick={() => handleCopyKey(key.value)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                          title="Copy"
                        >
                          <Clipboard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditKey(key)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenerateKey(key.id)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                          title="Regenerate"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
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

            {apiKeys.length === 0 && (
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
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Create API Key</h3>
              <form onSubmit={handleCreateKey}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Key Name
                    </label>
                    <input
                      type="text"
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter key name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="maxUsage" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Usage Limit
                    </label>
                    <input
                      type="number"
                      id="maxUsage"
                      value={newKeyMaxUsage}
                      onChange={(e) => setNewKeyMaxUsage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter max usage limit"
                      min="1"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum number of times this API key can be used
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewKeyName('');
                      setNewKeyMaxUsage('');
                    }}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-gray-800"
                  >
                    {isCreating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 