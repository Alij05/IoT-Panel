import { createContext, useEffect, useState } from "react";
import { getEntityById } from "../Services/HomeAssistantConnection";

export const ProductsContext = createContext()

export default function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]) // All Scanned Products

    const setAllProducts = async (allProducts) => {
        setProducts(allProducts)
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // const lightProduct = await getEntityById("switch.auto_light_room_light");
                // const tempProduct = await getEntityById("sensor.esp_temp_hum_lcd_dht11_temperature");
                // const humadityProduct = await getEntityById("sensor.esp_temp_hum_lcd_dht11_humidity");
                // const lockProduct = await getEntityById("switch.esp_lock_door_lock");
                // const flameProduct = await getEntityById("binary_sensor.flame_detector_flame_sensor");
                // const cameraProduct = await getEntityById("camera.esp_cam_sim800_esp_cam2");

                setProducts([
                    // lightProduct,
                    // lockProduct,
                    // tempProduct,
                    // humadityProduct,
                    // flameProduct,
                ]);
            } catch (error) {
                console.error("خطا در بارگذاری محصولات:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <ProductsContext.Provider value={{
            products,
            setAllProducts,
        }}>
            {children}
        </ProductsContext.Provider>
    )
}