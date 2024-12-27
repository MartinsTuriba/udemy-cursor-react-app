"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Bot, 
  FileText, 
  Terminal, 
  Receipt,
  FileCode,
  ChevronDown,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isActive = (path) => pathname === path;

  return (
    <div className="relative">
      {/* Toggle button - always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-40 bg-white border rounded-full p-1 hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        transition-all duration-300 ease-in-out
        min-h-screen bg-white border-r
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Logo section */}
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            {!isCollapsed && <span className="text-xl font-semibold">API Manager</span>}
          </Link>
        </div>

        {/* Account selector */}
        {!isCollapsed && (
          <div className="p-3">
            <button className="w-full px-3 py-2 text-sm text-left text-gray-700 rounded-lg hover:bg-gray-100 flex items-center justify-between">
              <span>Personal</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <Link
            href="/dashboards"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              isActive('/dashboards')
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="Overview"
          >
            <Home className="w-4 h-4" />
            {!isCollapsed && <span>Overview</span>}
          </Link>

          <Link
            href="/assistant"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              isActive('/assistant')
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="Research Assistant"
          >
            <Bot className="w-4 h-4" />
            {!isCollapsed && <span>Research Assistant</span>}
          </Link>

          <Link
            href="/reports"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              isActive('/reports')
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="Research Reports"
          >
            <FileText className="w-4 h-4" />
            {!isCollapsed && <span>Research Reports</span>}
          </Link>

          <Link
            href="/playground"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              isActive('/playground')
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="API Playground"
          >
            <Terminal className="w-4 h-4" />
            {!isCollapsed && <span>API Playground</span>}
          </Link>

          <Link
            href="/invoices"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              isActive('/invoices')
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="Invoices"
          >
            <Receipt className="w-4 h-4" />
            {!isCollapsed && <span>Invoices</span>}
          </Link>

          <Link
            href="/docs"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
              isActive('/docs')
                ? 'text-gray-900 bg-gray-100 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            title="Documentation"
          >
            <FileCode className="w-4 h-4" />
            {!isCollapsed && (
              <>
                <span>Documentation</span>
                <svg className="w-3 h-3 ml-1" viewBox="0 0 12 12" fill="none">
                  <path d="M3.5 3.5L8.5 8.5M8.5 8.5V3.5M8.5 8.5H3.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </>
            )}
          </Link>
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 w-full p-3 border-t bg-white">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 