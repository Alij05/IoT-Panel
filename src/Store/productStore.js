import { create } from "zustand";

const useProductStore = create((set, get) => ({
  products: [],

  setProducts: (products) => set({ products }),

  // آپدیت کردن وضعیت یک محصول مشخص
  updateProductState: (entity_id, newState) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.entity_id === entity_id ? { ...p, state: newState } : p
      ),
    })),

  // گرفتن یک محصول مشخص با entity_id
  getProductById: (entity_id) => {
    return get().products.find((p) => p.entity_id === entity_id);
  },
}));

export default useProductStore;


// import { create } from "zustand";

// const useProductStore = create((set) => ({
//     products: [],
//     setAllProducts: (productList) => set({ products: productList }),
//     addProduct: (newProduct) => set((state) => ({ products: [...state.products, newProduct] })),
//     clearProducts: () => set({ products: [] }),
// }))


// export default useProductStore

// store/productStore.js