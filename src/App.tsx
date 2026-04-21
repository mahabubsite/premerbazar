/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Finder } from './pages/Finder';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Report } from './pages/Report';
import { Gallery } from './pages/Gallery';
import { Admin } from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile) return <Navigate to="/onboarding" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/report" element={<Report />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/find" element={
            <Layout />
          }>
            <Route index element={<Finder />} />
          </Route>
          
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/find" replace />} />
            <Route path="matches" element={<Matches />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="/app/chat/:id" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
