import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string, goal?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccount: () => void;
  quickLoginDemo: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial user from storage
    const current = storage.getCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  const login = async (email: string, _password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const allUsers = storage.getAllUsers();
    const found = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (found) {
      storage.setCurrentUser(found);
      setUser(found);
      return { success: true };
    }

    // If user entered email not yet registered, auto-register as student user with their name from email
    const namePart = trimmedEmail.split('@')[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newUser = storage.registerUser(capitalizedName, trimmedEmail);
    storage.setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const register = async (name: string, email: string, _password?: string, goal?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const newUser = storage.registerUser(name.trim(), trimmedEmail, goal);
    storage.setCurrentUser(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...updates };
    storage.setCurrentUser(updated);
    setUser(updated);
  };

  const deleteAccount = () => {
    if (!user) return;
    const allUsers = storage.getAllUsers();
    const remaining = allUsers.filter((u) => u.id !== user.id);
    localStorage.setItem('healpath_users', JSON.stringify(remaining));
    logout();
  };

  const quickLoginDemo = (name: string, email: string) => {
    const allUsers = storage.getAllUsers();
    let found = allUsers.find((u) => u.email === email);
    if (!found) {
      found = storage.registerUser(name, email, 'Overcome study overwhelm and build mindful daily breaks');
    }
    storage.setCurrentUser(found);
    setUser(found);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
