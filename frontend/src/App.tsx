import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LandingPage from './components/LandingPage';
import ServiceRequestForm from './components/ServiceRequestForm';
import Dashboard from './components/Dashboard';
import ChannelPartnerDashboard from './components/ChannelPartnerDashboard';
import SystemIntegratorDashboard from './components/SystemIntegratorDashboard';
import FAQ from './components/FAQ';
import RCAModule from './components/RCAModule';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route 
                  path="/service-request" 
                  element={
                    <ProtectedRoute>
                      <ServiceRequestForm />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRoles={['service_team', 'epr_team']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/partner-dashboard"
                  element={
                    <ProtectedRoute requiredRoles={['channel_partner']}>
                      <ChannelPartnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integrator-dashboard"
                  element={
                    <ProtectedRoute requiredRoles={['system_integrator']}>
                      <SystemIntegratorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/faq" element={<FAQ />} />
                <Route 
                  path="/rca" 
                  element={
                    <ProtectedRoute requiredRoles={['service_team', 'epr_team']}>
                      <RCAModule />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <ChatBot />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;