import { useState } from 'react';
import { User, Admin } from '../types';

interface AuthState {
  user: User | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
}

export const useAuthStore = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    admin: null,
    isAuthenticated: false,
    isAdminAuthenticated: false
  });

  // Mock users database
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);

  // Mock admins database
  const [admins] = useState<Admin[]>([
    {
      id: 'admin-1',
      email: 'admin@bookease.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);

  const registerUser = (userData: { email: string; name: string; phone: string; password: string }) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setUsers(prev => [...prev, newUser]);
    setAuthState(prev => ({
      ...prev,
      user: newUser,
      isAuthenticated: true
    }));

    return newUser;
  };

  const loginUser = (email: string, password: string) => {
    // In a real app, you'd verify the password hash
    const user = users.find(u => u.email === email && u.isActive);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: true
    }));

    return user;
  };

  const loginAdmin = (email: string, password: string) => {
    // In a real app, you'd verify the password hash
    const admin = admins.find(a => a.email === email && a.isActive);
    if (!admin) {
      throw new Error('Invalid admin credentials');
    }

    setAuthState(prev => ({
      ...prev,
      admin,
      isAdminAuthenticated: true
    }));

    return admin;
  };

  const logoutUser = () => {
    setAuthState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false
    }));
  };

  const logoutAdmin = () => {
    setAuthState(prev => ({
      ...prev,
      admin: null,
      isAdminAuthenticated: false
    }));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    setUsers(prev => prev.map(u => u.id === authState.user!.id ? updatedUser : u));
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  return {
    ...authState,
    users,
    admins,
    registerUser,
    loginUser,
    loginAdmin,
    logoutUser,
    logoutAdmin,
    updateUserProfile
  };
};