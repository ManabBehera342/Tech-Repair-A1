import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingDown, AlertTriangle, FileText, Plus, Filter } from 'lucide-react';

interface RootCause {
  id: string;
  issue: string;
  productType: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  cause: string;
  solution: string;
  impact: string[];
  lastOccurrence: string;
}

const RCAModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'add'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');

  const rootCauses: RootCause[] = [
    {
      id: '1',
      issue: 'Device not charging',
      productType: 'Energizer Power Bank',
      frequency: 25,
      severity: 'high',
      cause: 'Faulty charging port due to poor quality control in manufacturing batch #2023-Q3',
      solution: 'Replace charging port assembly and improve QC testing protocols',
      impact: ['Customer dissatisfaction', 'Increased warranty claims', 'Brand reputation risk'],
      lastOccurrence: '2024-01-14'
    },
    {
      id: '2',
      issue: 'Remote control malfunction',
      productType: 'Gate Motor Controller',
      frequency: 18,
      severity: 'medium',
      cause: 'RF interference from nearby wireless devices and poor signal filtering',
      solution: 'Upgrade RF filtering components and provide better shielding',
      impact: ['Operational disruption', 'Service calls', 'Customer inconvenience'],
      lastOccurrence: '2024-01-13'
    },
    {
      id: '3',
      issue: 'Overheating during operation',
      productType: 'Power Adapter',
      frequency: 12,
      severity: 'high',
      cause: 'Inadequate thermal management and undersized heat sink design',
      solution: 'Redesign thermal management system with larger heat sink and better ventilation',
      impact: ['Safety concerns', 'Device failure', 'Potential fire hazard'],
      lastOccurrence: '2024-01-12'
    },
    {
      id: '4',
      issue: 'Display flickering',
      productType: 'Solar Panel Controller',
      frequency: 8,
      severity: 'low',
      cause: 'Poor connection between display module and main board',
      solution: 'Improve connector design and assembly process',
      impact: ['User experience degradation', 'Minor functionality issues'],
      lastOccurrence: '2024-01-10'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const filteredCauses = rootCauses.filter(cause => {
    const matchesSeverity = filterSeverity === 'all' || cause.severity === filterSeverity;
    const matchesProduct = filterProduct === 'all' || cause.productType === filterProduct;
    return matchesSeverity && matchesProduct;
  });

  const productTypes = Array.from(new Set(rootCauses.map(rc => rc.productType)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Root Cause Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Analyze recurring issues and their underlying causes
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <FileText className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'analysis', label: 'Detailed Analysis', icon: PieChart },
            { id: 'add', label: 'Add New RCA', icon: Plus }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{rootCauses.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Severity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {rootCauses.filter(rc => rc.severity === 'high').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Frequency</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(rootCauses.reduce((sum, rc) => sum + rc.frequency, 0) / rootCauses.length)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products Affected</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{productTypes.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Issues Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Issues by Frequency</h3>
              <div className="space-y-4">
                {rootCauses
                  .sort((a, b) => b.frequency - a.frequency)
                  .slice(0, 5)
                  .map((cause, index) => {
                    const maxFreq = Math.max(...rootCauses.map(rc => rc.frequency));
                    const percentage = (cause.frequency / maxFreq) * 100;
                    
                    return (
                      <div key={cause.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{cause.issue}</p>
                            <span className="text-sm text-gray-500">{cause.frequency} occurrences</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(cause.severity)}`}>
                              {cause.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeView === 'analysis' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="py-2 px-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  className="py-2 px-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Products</option>
                  {productTypes.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RCA Cards */}
            <div className="grid gap-6">
              {filteredCauses.map(cause => (
                <div key={cause.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {cause.issue}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {cause.productType}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(cause.severity)}`}>
                          {cause.severity} severity
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {cause.frequency} occurrences
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Root Cause</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                        {cause.cause}
                      </p>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Solution</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {cause.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Impact Areas</h4>
                      <div className="space-y-2 mb-4">
                        {cause.impact.map((impact, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{impact}</span>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Last occurrence: {new Date(cause.lastOccurrence).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New RCA Tab */}
        {activeTab === 'add' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add New Root Cause Analysis</h3>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issue Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Type
                  </label>
                  <select className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select Product Type</option>
                    {productTypes.map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <input
                    type="number"
                    placeholder="Number of occurrences"
                    className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity Level
                  </label>
                  <select className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Root Cause Analysis
                </label>
                <textarea
                  placeholder="Detailed analysis of the root cause..."
                  rows={4}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recommended Solution
                </label>
                <textarea
                  placeholder="Proposed solution to address the root cause..."
                  rows={4}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save RCA
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCAModule;