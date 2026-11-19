import { api } from './api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(api.util.resetApiState());
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('username', data.username);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    getProfile: builder.query({
      query: () => '/users/profile',
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
  useLoginMutation,
  useGetProfileQuery,
  useClientRegisterMutation,
} = authApi;