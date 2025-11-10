/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

// Supabase authentication and database exports
import { supabase } from './supabase';

export const auth = supabase.auth;
export const db = supabase;
