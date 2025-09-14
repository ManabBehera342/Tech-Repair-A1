import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { 
  User, Mail, Phone, MapPin, Calendar, Upload, CheckCircle,
  ArrowLeft, ArrowRight, Camera, X, AlertCircle, FileText
} from 'lucide-react';

interface ServiceRequest {
  contactDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  productDetails: {
    type: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
  };
  problemDetails: {
    description: string;
    issues: string[];
    photos: File[];
  };
}

const ServiceRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ServiceRequest>({
    contactDetails: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: ''
    },
    productDetails: {
      type: '',
      model: '',
      serialNumber: '',
      purchaseDate: ''
    },
    problemDetails: {
      description: '',
      issues: [],
      photos: []
    }
  });

  const issueCostMap: Record<string, number> = {
    'Device not turning on': 1500,
    'Charging issues': 800,
    'Overheating': 1200,
    'Physical damage': 2000,
    'Software malfunction': 1000,
    'Connectivity problems': 900,
    'Performance degradation': 1100,
    'Strange noises': 1300,
    'Display issues': 1800,
    'Button malfunction': 700,
  };

  const estimatedCost = useMemo(() => {
    return formData.problemDetails.issues.reduce((total, issue) => {
      const cost = issueCostMap[issue] || 0;
      return total + cost;
    }, 0);
  }, [formData.problemDetails.issues]);

  const productTypes = [
    'Energizer Power Bank',
    'Gate Motor Controller',
    'Power Adapter',
    'Battery Charger',
    'Solar Panel Controller',
    'Other'
  ];

  const commonIssues = Object.keys(issueCostMap);

  const steps = [
    { number: 1, title: 'Contact Details', icon: User },
    { number: 2, title: 'Product Details', icon: FileText },
    { number: 3, title: 'Problem Report', icon: AlertCircle },
    { number: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleInputChange = (section: keyof ServiceRequest, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleIssueToggle = (issue: string) => {
    setFormData(prev => ({
      ...prev,
      problemDetails: {
        ...prev.problemDetails,
        issues: prev.problemDetails.issues.includes(issue)
          ? prev.problemDetails.issues.filter(i => i !== issue)
          : [...prev.problemDetails.issues, issue]
      }
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 4 - formData.problemDetails.photos.length);
    setFormData(prev => ({
      ...prev,
      problemDetails: {
        ...prev.problemDetails,
        photos: [...prev.problemDetails.photos, ...newFiles]
      }
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      problemDetails: {
        ...prev.problemDetails,
        photos: prev.problemDetails.photos.filter((_, i) => i !== index)
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.contactDetails.name && formData.contactDetails.email && formData.contactDetails.phone);
      case 2:
        return !!(formData.productDetails.type && formData.productDetails.model);
      case 3:
        return !!(formData.problemDetails.description && formData.problemDetails.issues.length > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      addNotification({
        type: 'warning',
        title: 'Incomplete Information',
        message: 'Please fill in all required fields before proceeding.'
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const uploadPhotos = async (serialNumber: string, photos: File[]) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    photos.forEach(photo => form.append('photos', photo));
    await fetch(`${API_ENDPOINTS.UPLOAD_PHOTOS}/${serialNumber}`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: form,
    });
  };

  const submitRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const reqBody = {
        customerName: formData.contactDetails.name,
        customerEmail: formData.contactDetails.email,
        serialNumber: formData.productDetails.serialNumber,
        productDetails: `${formData.productDetails.type} ${formData.productDetails.model}`,
        purchaseDate: formData.productDetails.purchaseDate,
        photos: [],
        faultDescription: `[${formData.problemDetails.issues.join(', ')}] ${formData.problemDetails.description}`,
        estimatedCost: estimatedCost.toString(),
      };
      const response = await fetch(API_ENDPOINTS.SERVICE_REQUESTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(reqBody),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || 'Failed to submit request');
      }
      if (formData.problemDetails.photos.length && formData.productDetails.serialNumber) {
        try {
          await uploadPhotos(formData.productDetails.serialNumber, formData.problemDetails.photos);
        } catch {
          addNotification({
            type: 'warning',
            title: 'Photo Upload Failed',
            message: 'Your service request was submitted, but there was a problem uploading your attachments.',
          });
        }
      }
      addNotification({
        type: 'success',
        title: 'Service Request Submitted!',
        message: `Your request has been recorded. We'll contact you soon.`,
        duration: 0
      });
      setFormData({
        contactDetails: { name: '', email: '', phone: '', address: '' },
        productDetails: { type: '', model: '', serialNumber: '', purchaseDate: '' },
        problemDetails: { description: '', issues: [], photos: [] }
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was an error submitting your request. Please try again.'
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.contactDetails.name}
                  onChange={(e) => handleInputChange('contactDetails', 'name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.contactDetails.email}
                  onChange={(e) => handleInputChange('contactDetails', 'email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.contactDetails.phone}
                  onChange={(e) => handleInputChange('contactDetails', 'phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  placeholder="Address"
                  value={formData.contactDetails.address}
                  onChange={(e) => handleInputChange('contactDetails', 'address', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Type *</label>
                <select
                  value={formData.productDetails.type}
                  onChange={(e) => handleInputChange('productDetails', 'type', e.target.value)}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model *</label>
                <input
                  type="text"
                  placeholder="Product Model"
                  value={formData.productDetails.model}
                  onChange={(e) => handleInputChange('productDetails', 'model', e.target.value)}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serial Number</label>
                <input
                  type="text"
                  placeholder="Serial Number"
                  value={formData.productDetails.serialNumber}
                  onChange={(e) => handleInputChange('productDetails', 'serialNumber', e.target.value)}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.productDetails.purchaseDate}
                  onChange={(e) => handleInputChange('productDetails', 'purchaseDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Problem Description</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Describe the Problem *</label>
              <textarea
                placeholder="Please describe the issue in detail..."
                value={formData.problemDetails.description}
                onChange={(e) => handleInputChange('problemDetails', 'description', e.target.value)}
                rows={4}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Common Issues (Select all that apply) *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonIssues.map(issue => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => handleIssueToggle(issue)}
                    className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                      formData.problemDetails.issues.includes(issue)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Photos/Videos (Up to 4 files)</label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors duration-200">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-500">
                      PNG, JPG, MP4 up to 10MB each
                    </span>
                  </label>
                </div>
                {formData.problemDetails.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {formData.problemDetails.photos.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-400" />
                          )}
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Review Your Request</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Details</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData.contactDetails.name} - {formData.contactDetails.email} - {formData.contactDetails.phone}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Product</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {formData.productDetails.type} - {formData.productDetails.model}
                  {formData.productDetails.serialNumber && ` (SN: ${formData.productDetails.serialNumber})`}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Issues</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.problemDetails.issues.map(issue => (
                    <span key={issue} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{formData.problemDetails.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Attachments ({formData.problemDetails.photos.length})
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {formData.problemDetails.photos.map((file, index) => (
                    <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-600 rounded">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Estimated Cost</h4>
                <p className="text-gray-900 dark:text-gray-300 font-semibold text-lg">
                  ₹ {estimatedCost.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={submitRequest}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit Service Request</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-400'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {renderStepContent()}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestForm;
