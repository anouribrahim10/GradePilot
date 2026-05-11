require("@testing-library/jest-dom");

jest.mock('../src/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      signOut: () => Promise.resolve(),
    },
  }),
}));
