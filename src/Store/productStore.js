import { create } from "zustand";

const useProductStore = create((set, get) => ({
  products: [],

  setProducts: (products) => set({ products }),

  addProduct: (newProduct) =>
    set((state) => ({
      products: [...state.products, newProduct],
    })),

  deleteProduct: (entity_id) =>
    set((state) => ({
      products: state.products.filter((p) => p.entity_id !== entity_id),
    })),


  updateProductState: (entity_id, newState) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.entity_id === entity_id ? { ...p, state: newState } : p
      ),
    })),

  getProductById: (entity_id) => {
    return get().products.find((p) => p.entity_id === entity_id);
  },
}));

export default useProductStore;
