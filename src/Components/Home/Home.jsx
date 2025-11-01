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
import MotionDetectionCard from "../HomeCards/MotionDetectionCard";
import CameraCard from "../HomeCards/CameraCard";
import WeatherWidget from "../WeatherWidget/WeatherWidget";
import useProductStore from "../../Store/productStore";

const url = process.env.REACT_APP_URL;

export default function Home() {
    const { sensorsData, sensorsLogsData } = useSockets();
    const [allProducts, setAllProducts] = useState([]);
    const { products: userProducts, setProducts: setUserProducts } = useProductStore();
    const { isUserAdmin } = useAuth();

    useEffect(() => {
        if (isUserAdmin) {
            getAllProducts();
        } else {
            // getUserProducts();
        }
    }, [isUserAdmin]);

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
                <WeatherWidget />

                {productsToShow.map((product) => {
                    const deviceId = product.entity_id;
                    const deviceState = deviceId ? sensorsData?.[deviceId]?.state : null;
                    const deviceInfo = deviceId ? sensorsData?.[deviceId] : null;
                    const deviceStatus = deviceId ? sensorsLogsData?.[deviceId]?.msg : null;

                    switch (product.deviceClass) {
                        case "light":
                            return (
                                <LightCard
                                    key={deviceId}
                                    product={product}
                                    isUserAdmin={isUserAdmin}
                                    deviceState={deviceState}
                                    deviceInfo={deviceInfo}
                                    deviceStatus={deviceStatus}
                                    deiviceAutoStatus={sensorsData?.[deviceId]?.auto_enabled}
                                />
                            );
                        case "flame":
                            return (
                                <FlameCard
                                    key={deviceId}
                                    product={product}
                                    isUserAdmin={isUserAdmin}
                                    deviceState={deviceState}
                                    deviceInfo={deviceInfo}
                                    deviceStatus={deviceStatus}
                                />
                            );

	        case "reed":
                            let open_count = sensorsLogsData[deviceId]?.open_count
                            return (
                                <DoorCard
                                    key={deviceId}
                                    product={product}
                                    isUserAdmin={isUserAdmin}
                                    deviceState={deviceState}
                                    deviceInfo={deviceInfo}
                                    deviceStatus={deviceStatus}
                                    open_count={open_count}
                                />
                            );

                        case "temperature":
                            return (
                                <TempCard
                                    key={deviceId}
                                    product={product}
                                    isUserAdmin={isUserAdmin}
                                    deviceState={deviceState}
                                    deviceInfo={deviceInfo}
                                    deviceStatus={deviceStatus}
                                />
                            );
                        case "water":
                            return (
                                <WaterCard
                                    key={deviceId}
                                    product={product}
                                    isUserAdmin={isUserAdmin}
                                    deviceState={deviceState}
                                    deviceInfo={deviceInfo}
                                    deviceStatus={deviceStatus}
                                />
                            );
                        case "motion":
                            return (
                                <MotionDetectionCard
                                    key={deviceId}
                                    product={product}
                                    isUserAdmin={isUserAdmin}
                                    deviceState={deviceState}
                                    deviceInfo={deviceInfo}
                                    deviceStatus={deviceStatus}
                                />
                            );
                        case "camera":
                            return (
                                <div key={deviceId} className="btn-cell" style={{ minHeight: "200px" }}>
                                    <CameraCard cameraId={deviceId} />
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </MasonryGrid>
        </div>
    );
}
