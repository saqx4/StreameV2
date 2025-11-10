/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../config/auth';
import { createUserDocument } from '../services/databaseService';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, displayName?: string) => {
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      // Provide better error messages
      if (error.message.includes('already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      throw error;
    }
    
    const user = data.user;
    if (!user) {
      throw new Error('Signup failed. Please try again.');
    }
    
    // Check if email confirmation is required
    if (data.session === null) {
      throw new Error('Please check your email to confirm your account before signing in.');
    }
    
    const mapped: AuthUser = {
      uid: user.id,
      email: user.email ?? null,
      displayName: (user.user_metadata as any)?.display_name ?? null,
    };
    
    try {
      await createUserDocument(mapped);
      setCurrentUser(mapped);
    } catch (dbError) {
      console.error('Database error during signup:', dbError);
      // Even if database fails, the auth account was created
      throw new Error('Account created but profile setup failed. Please try signing in.');
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await auth.signInWithPassword({ email, password });
    if (error) {
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      }
      throw error;
    }
    const user = data.user;
    if (user) {
      const mapped: AuthUser = {
        uid: user.id,
        email: user.email ?? null,
        displayName: (user.user_metadata as any)?.display_name ?? null,
      };
      // Ensure user document exists
      try {
        await createUserDocument(mapped);
      } catch (dbError) {
        console.error('Failed to create/update user document on login:', dbError);
        // Don't fail login if database sync fails
      }
      setCurrentUser(mapped);
    }
  };

  const logout = async () => {
    const { error } = await auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser?.email) {
      throw new Error('User must be logged in to change password');
    }

    // First, verify the current password by re-authenticating
    const { error: signInError } = await auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Current password is incorrect');
    }

    // If current password is correct, update to new password
    const { error: updateError } = await auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback',
    });
    if (error) throw error;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await auth.getSession();
        const session: Session | null = data?.session ?? null;
        if (!mounted) return;
        const user = session?.user ?? null;
        if (user) {
          const mapped: AuthUser = {
            uid: user.id,
            email: user.email ?? null,
            displayName: (user.user_metadata as any)?.display_name ?? null,
          };
          await createUserDocument(mapped);
          setCurrentUser(mapped);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't crash the app if auth fails
        setCurrentUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    try {
      const { data: subscription } = auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          const user = session?.user ?? null;
          if (user) {
            const mapped: AuthUser = {
              uid: user.id,
              email: user.email ?? null,
              displayName: (user.user_metadata as any)?.display_name ?? null,
            };
            await createUserDocument(mapped);
            setCurrentUser(mapped);
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setCurrentUser(null);
        }
        setLoading(false);
      });

      init();

      return () => {
        mounted = false;
        subscription.subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Auth subscription error:', error);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    changePassword,
    requestPasswordReset,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
