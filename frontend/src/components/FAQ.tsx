import React, { useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  rating: number;
  helpful: number;
  notHelpful: number;
}

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How long does a typical repair take?',
      answer: 'Most repairs are completed within 3-5 business days. Complex issues may take up to 7-10 days. We provide regular updates throughout the process.',
      category: 'General',
      rating: 4.8,
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '2',
      question: 'What warranty do you provide on repairs?',
      answer: 'We offer a 90-day warranty on all repair work. If the same issue occurs within this period, we will fix it free of charge.',
      category: 'Warranty',
      rating: 4.9,
      helpful: 52,
      notHelpful: 2
    },
    {
      id: '3',
      question: 'Can I track my repair status online?',
      answer: 'Yes! Once you submit a service request, you will receive a tracking number. You can use this to check the status of your repair at any time.',
      category: 'Tracking',
      rating: 4.7,
      helpful: 38,
      notHelpful: 4
    },
    {
      id: '4',
      question: 'What types of electronic devices do you repair?',
      answer: 'We specialize in Energizer products, Gate Motor Controllers, Power Adapters, Battery Chargers, and Solar Panel Controllers. Contact us for other device types.',
      category: 'Services',
      rating: 4.6,
      helpful: 33,
      notHelpful: 5
    },
    {
      id: '5',
      question: 'How much does a repair typically cost?',
      answer: 'Repair costs vary depending on the device and issue. We provide free diagnostics and will give you a detailed estimate before starting any work.',
      category: 'Pricing',
      rating: 4.5,
      helpful: 41,
      notHelpful: 7
    },
    {
      id: '6',
      question: 'What should I do if my device is still under warranty?',
      answer: 'If your device is under manufacturer warranty, we recommend contacting the manufacturer first. We can help with warranty claims and repairs.',
      category: 'Warranty',
      rating: 4.8,
      helpful: 29,
      notHelpful: 2
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleRating = (id: string, isHelpful: boolean) => {
    // In a real app, this would update the database
    console.log(`Rating FAQ ${id} as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.question}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`ml-4 transform transition-transform ${
                    expandedItems.has(item.id) ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedItems.has(item.id) && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="pt-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {item.answer}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Was this helpful?</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRating(item.id, true)}
                            className="flex items-center space-x-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{item.helpful}</span>
                          </button>
                          <button
                            onClick={() => handleRating(item.id, false)}
                            className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm">{item.notHelpful}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No FAQs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
          <p className="text-blue-100 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors">
              Contact Support
            </button>
            <button className="border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              Submit a Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;