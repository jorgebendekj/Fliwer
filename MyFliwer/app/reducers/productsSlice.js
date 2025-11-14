import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from '../utils/apiService';

// Thunks
export const getProducts = createAsyncThunk('products/getAll', async (_, { rejectWithValue }) => {
    try {
        const response = await invoiceService.getProducts();
        //debugger;
        //merge response to handProducts
        debugger;
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const putProduct = createAsyncThunk('products/put', async (product, { rejectWithValue }) => {
    try {
        const response = await invoiceService.putProduct(product);
        return response.product;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const editProduct = createAsyncThunk('products/edit', async ({ product, data }, { rejectWithValue }) => {
    try {
        const response = await invoiceService.modifyProduct(product, data);
        return response.product;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
    try {
        await invoiceService.deleteProduct(id);
        return id;
    } catch (error) {
        return rejectWithValue(error);
    }
});

// Estado inicial
const initialState = {
    products: [],
    loading: false,
    error: null,
};

// Slice
const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        addFakeProduct: (state, action) => {
            state.products.unshift(action.payload);
        },
        editProductLocally: (state, action) => {
            const { product, data } = action.payload;
            const index = state.products.findIndex(p => p.id === product);

            if (index !== -1) {
                const existingProduct = state.products[index];
                const updatedProduct = { ...existingProduct };

                for (const key in data) {
                    if (key === "customFields" && Array.isArray(data.customFields)) {
                        const updatedCustoms = [...(existingProduct.customFields || [])];

                        data.customFields.forEach(({ id, value }) => {
                            const i = updatedCustoms.findIndex(f => f.id === id);
                            if (i !== -1) {
                                updatedCustoms[i].value = value;
                            } else {
                                updatedCustoms.push({ id, value });
                            }
                        });

                        updatedProduct.customFields = updatedCustoms;
                    } else {
                        updatedProduct[key] = data[key];
                    }
                }

                state.products[index] = updatedProduct;
            }
        }

    },
    extraReducers: (builder) => {
        builder
            // GET
            .addCase(getProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.products = action.payload;
                state.loading = false;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // PUT
            .addCase(putProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })

            // EDIT
            .addCase(editProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                } else {
                    state.products.push(action.payload);
                }
            })

            // DELETE
            .addCase(deleteProduct.fulfilled, (state, action) => {
                const deletedId = String(action.payload);
                state.products = state.products.filter(p => String(p.id) !== deletedId);
            });

    }
});

export const { addFakeProduct, editProductLocally } = productsSlice.actions;
export default productsSlice.reducer;
