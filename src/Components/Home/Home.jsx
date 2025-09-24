import React, { useEffect, useState } from "react";
import "./Home.css";
import axios from "axios";
import TempCard from "../HomeCards/TempCard";
import MasonryGrid from "../HomeCards/MasnoryGrid";
import ErrorBox from "../ErrorBox/ErrorBox";
import { useAuth } from "../../Contexts/AuthContext";
import { useSockets } from "../../Contexts/SocketProvider";
import LightCard from "../HomeCards/LightCard";
import FlameCard from "../HomeCards/FlameCard";
import WaterCard from "../HomeCards/WaterCard";

const url = process.env.REACT_APP_URL;

export default function Home() {
    const { sensorsData } = useSockets();
    const [allProducts, setAllProducts] = useState([]);
    const [userProducts, setUserProducts] = useState([]);
    const { isUserAdmin } = useAuth();

    useEffect(() => {
        if (isUserAdmin) {
            getAllProducts();
        } else {
            getUserProducts();
        }
    }, [isUserAdmin]);

    useEffect(() => {
        // console.log(sensorsData);

    }, [])

    async function getUserProducts() {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${url}/api/devices/mine`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) setUserProducts(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function getAllProducts() {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${url}/api/devices`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 200) setAllProducts(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const productsToShow = isUserAdmin ? allProducts : userProducts;

    if (!productsToShow || productsToShow.length === 0) {
        return <ErrorBox msg={"هیچ دستگاهی یافت نشد"} />;
    }

    return (
        <div className="home-wrapper">
            <MasonryGrid>
                {productsToShow.map((product) => {
                    const deviceId = product.entity_id;
                    const deviceData = deviceId ? sensorsData?.[deviceId]?.state : null;
                    // console.log('deviceData', deviceData);
                    // console.log("product", product);
                    return (
                        <div key={product.entity_id}>
                            {product.deviceClass === 'light' && (<LightCard product={product} isUserAdmin={isUserAdmin} deviceState={deviceData} />)}
                            {product.deviceClass === 'flame' && (<FlameCard product={product} isUserAdmin={isUserAdmin} deviceState={deviceData} />)}
                            {product.deviceClass === 'temperature' && (<TempCard product={product} isUserAdmin={isUserAdmin} deviceState={deviceData} />)}
                            {product.deviceClass === 'water' && (<WaterCard product={product} isUserAdmin={isUserAdmin} deviceState={deviceData} />)}
                        </div>
                    );
                })}
            </MasonryGrid>
        </div>
    );
}
