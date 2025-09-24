import { create } from "zustand";

const useDeviceStatusStore = create((set) => ({
    allProducts: [],
    userProducts: [],

    // آپدیت وضعیت یک محصول در هر دو لیست
    updateProductState: (entityID, newState) =>
        set((state) => ({
            allProducts: state.allProducts.map((product) =>
                product.entity_id === entityID
                    ? { ...product, state: newState }
                    : product
            ),
            userProducts: state.userProducts.map((product) =>
                product.entity_id === entityID
                    ? { ...product, state: newState }
                    : product
            ),
        })),

    // toggle کردن وضعیت محصول
    toggleProductState: (entityID) =>
        set((state) => {
            const findInAll = state.allProducts.find(p => p.entity_id === entityID);
            const findInUser = state.userProducts.find(p => p.entity_id === entityID);

            // اولویت با allProducts، اگه نبود از userProducts می‌گیریم
            const current = findInAll?.state || findInUser?.state || "off";
            const newState = current === "on" ? "off" : "on";

            return {
                allProducts: state.allProducts.map((product) =>
                    product.entity_id === entityID
                        ? { ...product, state: newState }
                        : product
                ),
                userProducts: state.userProducts.map((product) =>
                    product.entity_id === entityID
                        ? { ...product, state: newState }
                        : product
                ),
            };
        }),

    setAllProducts: (products) => set({ allProducts: products }),
    setUserProducts: (products) => set({ userProducts: products }),
}));

export default useDeviceStatusStore;
