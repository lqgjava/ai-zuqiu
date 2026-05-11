'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化会话
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError('Supabase 未配置');
      return;
    }

    let active = true;

    async function initSession() {
      try {
        const { data, error } = await supabase!.auth.getSession();
        if (active) {
          if (error) throw error;
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : '获取会话失败');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initSession();

    // 监听认证状态变化
    const { data: authListener } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        if (active) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 发送 OTP 登录链接
  async function signInWithOtp(email: string) {
    if (!supabase) {
      throw new Error('Supabase 未配置');
    }

    try {
      setError(null);
      const { error } = await supabase!.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
      throw err;
    }
  }

  // 注册（使用 OTP）
  async function signUp(email: string) {
    if (!supabase) {
      throw new Error('Supabase 未配置');
    }

    try {
      setError(null);
      const { error } = await supabase!.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败';
      setError(message);
      throw err;
    }
  }

  // 登出
  async function signOut() {
    if (!supabase) {
      throw new Error('Supabase 未配置');
    }

    try {
      setError(null);
      const { error } = await supabase!.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '登出失败';
      setError(message);
      throw err;
    }
  }

  // 验证 OTP 码（可选，用于更高级的流程）
  async function verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'magiclink') {
    if (!supabase) {
      throw new Error('Supabase 未配置');
    }

    try {
      setError(null);
      const { data, error } = await supabase!.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '验证失败';
      setError(message);
      throw err;
    }
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithOtp,
    signUp,
    signOut,
    verifyOtp,
  };
}
