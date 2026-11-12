import { api } from './api';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Product'],
    }),

    getMyProducts: builder.query({
      query: () => '/products/mine',
      providesTags: ['Product'],
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),

    uploadProductImage: builder.mutation({
      query: (file) => ({
        url: '/products/upload-image',
        method: 'POST',
        body: file,
      }),
    }),

    addProduct: builder.mutation({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetMyProductsQuery,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;