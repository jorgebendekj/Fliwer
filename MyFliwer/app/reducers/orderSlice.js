// src/state/orders/orderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const getPriceByType = (item, priceType = 'price') => {
  if (priceType === 'price') return parseFloat(item.price || 0);

  const fieldId = parseInt(priceType.replace('cf_', ''), 10);
  const field = item.customFields?.find(f => f.id === fieldId);
  if (!field?.value) return 0;

  return parseFloat(field.value.replace('€', '').replace(',', '.') || 0);
};

const recalculateTotals = (products) => {
  const totalQuantity = products.reduce((a, p) => a + p.quantity, 0);
  const totalPrice = products.reduce((a, p) => {
    var price = getPriceByType(p, p.priceType || 'price');
    if(p.discount){
        price = Math.round((p.discount<0?(price * (1 - (-1*p.discount) / 100)):(price * (1 + p.discount / 100))) * 100) / 100;
    }
    return a + price * p.quantity;
  }, 0);
  return { totalQuantity, totalPrice };
};

const initialState = {
  orders: [],
  currentOrderId: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    getAllOrders(state, action) {
      state.orders = action.payload.map(o => ({ ...o, status: 'saved' }));
    },
    addOrder(state, action) {
      const idx = state.orders.findIndex(o => o.id === action.payload.id);
      const newOrder = { ...action.payload, status: 'pending' };
      if (idx !== -1) {
        state.orders[idx] = newOrder;
      } else {
        state.orders.push(newOrder);
      }
    },
    editOrder(state, action) {
      const idx = state.orders.findIndex(o => o.id === action.payload.id);
      const updatedOrder = { ...action.payload, status: 'pending' };
      if (idx !== -1) {
        state.orders[idx] = updatedOrder;
      } else {
        state.orders.push(updatedOrder);
      }
    },
    deleteOrder(state, action) {
      state.orders = state.orders.filter(o => o.id !== action.payload);
    },
    clearOrders(state) {
      state.orders = [];
    },
    setCurrentOrder(state, action) {
      state.currentOrderId = action.payload;
    },
    upsertOrderItem(state, action) {
      const { orderId, item, quantity, priceType , discount, comment } = action.payload;
      const order = state.orders.find(o => o.id == orderId);
      if (!order) return;

      const products = [...(order.products || [])];
      const idx = products.findIndex(p => p.id == item.id && p.priceType == priceType);
      if (idx !== -1 && quantity==0) {
        products.splice(idx, 1);
      } else if (idx !== -1) {
        products[idx].quantity = quantity;
        if(comment || comment=="")products[idx].comment = comment;
        if(discount!==undefined && discount!=null)products[idx].discount = discount;
      } else {
        products.push({ ...item, quantity, priceType: priceType?priceType:'price', discount, comment });
      }

      const { totalPrice, totalQuantity } = recalculateTotals(products);

      order.products = products;
      order.totalQuantity = totalQuantity;
      order.totalPrice = totalPrice;
      order.status = 'editing';
    },
    deleteOrderItem(state, action) {
      const { orderId, itemId, priceType } = action.payload;
      const order = state.orders.find(o => o.id == orderId);
      if (!order) return;

      const products = (order.products || []).filter(p => p.id != itemId || (priceType && p.priceType !== priceType));
      const { totalPrice, totalQuantity } = recalculateTotals(products);

      order.products = products;
      order.totalQuantity = totalQuantity;
      order.totalPrice = totalPrice;
      order.status = 'editing';
    },
    setOrderStatus(state, action) {
      const { orderId, status } = action.payload;
      const idx = state.orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        state.orders[idx].status = status;
      }
    }
  }
});

export const {
  getAllOrders,
  addOrder,
  editOrder,
  deleteOrder,
  clearOrders,
  setCurrentOrder,
  upsertOrderItem,
  deleteOrderItem,
  setOrderStatus
} = orderSlice.actions;

export default orderSlice.reducer;
