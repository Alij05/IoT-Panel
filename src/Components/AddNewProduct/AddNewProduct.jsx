import React, { useState, useEffect, useRef } from 'react';
import './AddNewProduct.css';
import { toast } from 'react-toastify';
import TokenRoundedIcon from '@mui/icons-material/TokenRounded';
import { Html5Qrcode } from 'html5-qrcode';
import useProductStore from '../../Store/productStore';
import { getEntityById } from '../../Services/HomeAssistantConnection';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const url = process.env.REACT_APP_URL

const locations = [
    { value: "kitchen", name: "آشپزخانه" },
    { value: "bedroom", name: "اتاق خواب" },
    { value: "bathroom", name: "حمام" },
    { value: "livingroom", name: "اتاق نشیمن" },
    { value: "diningroom", name: "اتاق غذاخوری" },
    { value: "balcony", name: "بالکن" },
    { value: "garage", name: "گاراژ" },
    { value: "office", name: "دفتر کار" },
    { value: "garden", name: "باغچه" },
    { value: "hallway", name: "راهرو" }
];

export default function AddNewProduct() {
    const [token, setToken] = useState('');
    const [deviceClass, setDeviceClass] = useState('');
    const [tokens, setTokens] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [isScanned, setIsScanned] = useState(false);
    const [userLocations, setUserLocations] = useState([]);
    const [deviceName, setDeviceName] = useState('');
    const [deviceLocation, setDeviceLocation] = useState('');

    const setAllProducts = useProductStore((state) => state.setAllProducts)
    const navigate = useNavigate()

    const html5QrCodeRef = useRef(null);
    const isScannerRunningRef = useRef(false);
    const isStoppingRef = useRef(false);

    const userToken = localStorage.getItem('token')

    useEffect(() => {
        const qrRegionId = 'qr-reader';

        if (scanning) {
            html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

            Html5Qrcode.getCameras()
                .then((devices) => {
                    if (!devices || devices.length === 0) {
                        toast.error('هیچ دوربینی پیدا نشد', { className: 'toast-center' });
                        setScanning(false);
                        return;
                    }

                    const cameraId = devices.length > 1 ? devices[1].id : devices[0].id;

                    html5QrCodeRef.current.start(
                        cameraId,
                        { fps: 20, qrbox: { width: 250, height: 250 } },

                        (decodedText) => {
                            try {
                                const deviceData = JSON.parse(decodedText);
                                console.log("deviceData", deviceData);

                                // از device_id استفاده کن
                                setToken(deviceData.device_id);
                                setDeviceClass(deviceData.deviceClass);

                                setIsScanned(true);
                                toast.success('دستگاه با موفقیت اسکن شد!', { className: 'toast-center' });

                                // توقف اسکنر
                                if (isScannerRunningRef.current && !isStoppingRef.current) {
                                    isStoppingRef.current = true;
                                    html5QrCodeRef.current.stop()
                                        .then(() => {
                                            html5QrCodeRef.current.clear();
                                            html5QrCodeRef.current = null;
                                            isScannerRunningRef.current = false;
                                            isStoppingRef.current = false;
                                            setScanning(false);
                                        })
                                        .catch((err) => {
                                            console.error('خطا در توقف اسکن:', err);
                                            isStoppingRef.current = false;
                                        });
                                }

                            } catch (err) {
                                toast.error("QR Code معتبر نیست یا فرمت JSON ندارد", { className: 'toast-center' });
                            }
                        }

                    )
                        .then(() => { isScannerRunningRef.current = true; })
                        .catch((err) => {
                            console.error('خطا هنگام شروع اسکن:', err);
                            toast.error('خطا در باز کردن دوربین: ' + (err?.message || JSON.stringify(err)), { className: 'toast-center' });
                            setScanning(false);
                        });
                })
                .catch((err) => {
                    console.error('خطا در دریافت دوربین‌ها:', err);
                    toast.error('خطا در دریافت دوربین‌ها', { className: 'toast-center' });
                    setScanning(false);
                });
        } else {
            if (html5QrCodeRef.current && isScannerRunningRef.current && !isStoppingRef.current) {
                isStoppingRef.current = true;
                html5QrCodeRef.current.stop()
                    .catch(() => { })
                    .finally(() => {
                        html5QrCodeRef.current.clear();
                        html5QrCodeRef.current = null;
                        isScannerRunningRef.current = false;
                        isStoppingRef.current = false;
                    });
            }
        }

        return () => {
            if (html5QrCodeRef.current && isScannerRunningRef.current && !isStoppingRef.current) {
                isStoppingRef.current = true;
                html5QrCodeRef.current.stop()
                    .catch(() => { })
                    .finally(() => {
                        html5QrCodeRef.current.clear();
                        html5QrCodeRef.current = null;
                        isScannerRunningRef.current = false;
                        isStoppingRef.current = false;
                    });
            }
        };
    }, [scanning]);


    useEffect(() => {
        const storedLocations = localStorage.getItem('locations');
        if (storedLocations) {
            let parsed = JSON.parse(storedLocations);
            if (!Array.isArray(parsed)) parsed = [parsed];
            setUserLocations(parsed);
        }
    }, []);


    const handleScanClick = () => setScanning(prev => !prev);

    const handleAddLocation = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === '-1') return;
        setDeviceLocation(selectedValue);

        const selectedLocation = locations.find(loc => loc.value === selectedValue);
        let previousLocations = userLocations;

        if (selectedLocation && !previousLocations.some(loc => loc.value === selectedLocation.value)) {
            const newLocations = [...previousLocations, selectedLocation];
            setUserLocations(newLocations);
            localStorage.setItem('locations', JSON.stringify(newLocations));
        }
    };

    const addDevicesToDashboard = async () => {
        if (!token) {
            toast.error('هیچ دستگاهی برای اضافه کردن وجود ندارد', { className: 'toast-center' });
            return;
        }

        const deviceLocationName = locations.find(loc => loc.value === deviceLocation)?.name || "نامشخص";

        const deviceObject = {
            entity_id: token,
            deviceClass: deviceClass,
            deviceName: deviceName || 'بدون نام',
            deviceLocationName
        };

        try {
            const res = await axios.post(`${url}/api/devices`, {
                data: deviceObject
            }, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (res.status === 200) {
                toast.success(`دستگاه ${deviceName} اضافه شد`, { className: 'toast-center' });
                setToken('');
                setDeviceName('');
                setDeviceLocation('');
                setIsScanned(false);
                navigate('/products');
            }

        } catch (err) {
            if (err.response) {
                if (err.response.status === 409) {
                    toast.error('! این دستگاه قبلاً ثبت شده یا متعلق به شخص دیگری است', { className: 'toast-center' });
                } else if (err.response.status === 400) {
                    toast.error('اطلاعات دستگاه نامعتبر است', { className: 'toast-center' });
                }
            } else {
                toast.error('خطا در ارتباط با سرور', { className: 'toast-center' });
            }
        }
    };


    return (
        <>
            <div className="products-main">
                <h1 className="products-title">ثبت دستگاه</h1>

                <form className="add-products-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="add-products-form-wrap">
                        <div className="add-products-form-group">
                            <TokenRoundedIcon className="input-icon" />
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="device-token"
                                    className="add-products-input token-input"
                                    autoComplete="off"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="توکن دستگاه"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="button" className="fancy-button" onClick={handleScanClick} style={{ marginTop: '10px' }}>
                        <span className="shadow"></span>
                        <span className="edge"></span>
                        <span className="front text">{scanning ? 'لغو اسکن' : 'اسکن'}</span>
                    </button>
                </form>

                {scanning && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                        <div id="qr-reader" style={{ width: '300px' }} />
                    </div>
                )}
            </div>

            {isScanned && (
                <div className="overlay">
                    <div className='modal-container'>
                        <button
                            onClick={() => setIsScanned(false)}
                            style={{ position: 'absolute', top: 10, right: 10, fontSize: 20, background: 'transparent', border: 'none', cursor: 'pointer' }}
                            aria-label="بستن"
                        >
                            ×
                        </button>

                        <input
                            className='location-name-input'
                            type="text"
                            placeholder='نام سنسور'
                            onChange={(e) => setDeviceName(e.target.value)}
                        />

                        <div className="custom-select-wrapper">
                            <select onChange={handleAddLocation} defaultValue="-1">
                                <option value="-1">انتخاب مکان</option>
                                {locations.map(loc => (
                                    <option key={loc.value} value={loc.value}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <button className='confirm-location-btn' onClick={addDevicesToDashboard}>تایید</button>
                    </div>
                </div>
            )}
        </>
    );
}
