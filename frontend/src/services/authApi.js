import { api } from './api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/admin/login',
        method: 'POST',
        body: credentials,
      }),

      adminRegister: builder.mutation({
        query: (registration) => ({
          url: '/auth/admin/register',
          method: 'POST',
          body: registration,
        }),
      }),

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          localStorage.setItem('token', data.access_token);
          localStorage.setItem('role', data.role);
        } catch (error) {
          console.error('Admin login failed:', error);
        }
      },
    }),

    clientLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/client/login',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          localStorage.setItem('token', data.access_token);
          localStorage.setItem('role', data.role);
        } catch (error) {
          console.error('Client login failed:', error);
        }
      },
    }),

    clientRegister: builder.mutation({
      query: (userData) => ({
        url: '/auth/client/register',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminRegisterMutation,
  useClientLoginMutation,
  useClientRegisterMutation,
} = authApi;