// This file has been replaced with local API client
// Import from @/lib/api instead

// Dummy export for backward compatibility
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Use api.signIn instead') }),
    signUp: async () => ({ data: null, error: new Error('Use api.signUp instead') }),
    signOut: async () => ({ error: null }),
  },
  storage: {
    from: () => ({
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  from: () => ({
    select: () => ({ data: null, error: new Error('Use api functions instead') }),
    insert: () => ({ data: null, error: new Error('Use api functions instead') }),
    update: () => ({ data: null, error: new Error('Use api functions instead') }),
    delete: () => ({ data: null, error: new Error('Use api functions instead') }),
  }),
};
