import { api } from './api';

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `/cart/${id}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    saveCartItemForLater: builder.mutation({
      query: (id) => ({
        url: `/cart/${id}/save-for-later`,
        method: 'POST',
      }),
      invalidatesTags: ['Cart', 'SavedItems'],
    }),

    removeFromCart: builder.mutation({
      query: (id) => ({
        url: `/cart/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    getSavedItems: builder.query({
      query: () => '/saved-items',
      providesTags: ['SavedItems'],
    }),

    saveItem: builder.mutation({
      query: (productId) => ({
        url: '/saved-items',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['SavedItems'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useSaveCartItemForLaterMutation,
  useRemoveFromCartMutation,
  useGetSavedItemsQuery,
  useSaveItemMutation,
} = cartApi;