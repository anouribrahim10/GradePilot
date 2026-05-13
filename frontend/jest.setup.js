require("@testing-library/jest-dom");

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signOut: () => Promise.resolve(),
    },
  }),
}));
