import React, { useContext, useEffect, useRef, useState } from 'react'
// import '../UsersTable/UsersTable.css'
import './ProductsTable.css'
import DeleteModal from '../DeleteModal/DeleteModal'
import DetailsModal from '../DetailsModal/DetailsModal'
import ErrorBox from '../ErrorBox/ErrorBox'
import Chart from '../Cards/Chart'
import Humadity from '../Cards/Humadity'
import Temperature from '../Cards/Temperature'
import LightControl from '../Cards/LightControl'
import { SearchContext } from '../../Contexts/SearchContext'
import { getEntities, getEntityById, getEntityHistory, lockSwitch, turnOffFan, turnOffSmartRelay, turnOffSwitch, turnOnFan, turnOnSmartRelay, turnOnSwitch, unLockSwitch } from '../../Services/HomeAssistantConnection'
import { toast } from 'react-toastify'
import CameraStream from '../Cards/CameraStream'
import WebRTCCamera from '../Cards/WebRTCCamera'
import { getCameraStreamUrl } from '../../Services/HomeAssistantConnection'
import FlameAlert from '../Cards/FlameAlert'
import { ProductsContext } from '../../Contexts/ProductsContext'
import useProductStore from '../../Store/productStore'
import RGBColorPicker from '../Cards/RGBColorPicker'
import FanStatus from '../Cards/FanStatus'
import SmartRelayStatus from '../Cards/SmartRelayStatus'
import WaterMoistureStatus from '../Cards/WaterMoistureStatus'
import { getSocket } from '../../WebSocket/Socket'
import useUsersStore from '../../Store/usersStore'
import EastIcon from '@mui/icons-material/East';
import { useAuth } from '../../Contexts/AuthContext'
import axios from 'axios'
import useDeviceStatusStore from '../../Store/deviceStateStore'
import { useSockets } from '../../Contexts/SocketProvider'


const BASE_URL = process.env.REACT_APP_HA_BASE_URL
const TOKEN = process.env.REACT_APP_HA_TOKEN
const url = process.env.REACT_APP_URL

export default function ProductsTable() {

    const { sensorsData } = useSockets()


    const contextData = useContext(SearchContext)
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);

    const [products, setProducts] = useState([])
    const [userProducts, setUserProducts] = useState([])
    const [userProductsByAdmin, setuserProductsByAdmin] = useState([])
    const [productInfo, setProductInfo] = useState([])
    const [isShowDetailsModal, setIsShowDetailsModal] = useState(false)
    const [isPending, setIsPending] = useState(true)

    const [isSwitchOn, setIsSwitchOn] = useState(null)
    const [fanStatus, setFanStatus] = useState(null)
    const { allProducts, updateProductState } = useDeviceStatusStore()

    const [isSmartRelayOn, setIsSmartRelayOn] = useState(null)
    const [isSwitchLock, setIsSwitchLock] = useState(true)
    const [temperature, setTemperature] = useState(0)
    const [humadity, setHumadity] = useState(0)
    const [waterMoisture, setWaterMoisture] = useState(0)
    const [waterStatus, setWaterStatus] = useState(0)
    const [flame, setFlame] = useState(false)
    const [isShowRGBColorPicker, setIsShowRGBColorPicker] = useState(true)

    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const nextIdRef = useRef(1);

    const { isUserAdmin, username } = useAuth()


    useEffect(() => {
        getUserProducts()
        getUsers()

    }, [])


    const getUsers = () => {
        axios.get(`${url}/api/auth/users`)
            .then(res => {
                setUsers(res.data)
                setIsPending(false)
                // contextData.setSearchSourceData(res.data)
            })
    }

    async function getUserProducts() {
        const token = localStorage.getItem('token')
        try {
            const res = await axios.get(`${url}/api/devices/mine`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.status === 200) {
                // console.log('Sensors -->', res.data);
                setUserProducts(res.data)
            }

        } catch (err) {
            console.log(err);
        }
    }

    async function seeUserDevicesByAdmin(selectedUser) {
        const adminToken = localStorage.getItem('token')
        console.log(selectedUser.username);

        try {
            const res = await axios.get(`${url}/api/devices/${selectedUser.username}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            })
            if (res.status === 200) {
                setuserProductsByAdmin(res.data)
            }

        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    toast.error(`مشاهده دستگاه های ${selectedUser.username} با مشکل مواجه شد `, { className: 'toast-center' });
                }
            }
        }
    }


    async function fetchTurnOffSwitch(entityID) {
        try {
            if (!isSwitchOn) {
                toast.warn('لامپ در حال حاضر خاموش است !', { className: 'toast-center' });
                return
            }
            await turnOffSwitch(entityID)
            toast.success('لامپ خاموش شد', { className: 'toast-center' })
        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error('خاموش کردن لامپ با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchTurnOnSwitch(entityID) {
        try {
            if (isSwitchOn) {
                toast.warn('لامپ در حال حاضر روشن است !', { className: 'toast-center' });
                return
            }
            await turnOnSwitch(entityID)
            toast.success('لامپ روشن شد', { className: 'toast-center' })
        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error('روشن کردن لامپ با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchLockSwitch(entityID) {
        try {
            if (isSwitchLock) {
                toast.warn('درب در حال حاضر قفل است !', { className: 'toast-center' });
                return
            }
            await lockSwitch(entityID)
            toast.success('درب قفل شد', { className: 'toast-center' })
        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error('قفل کردن درب با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchUnLockSwitch(entityID) {
        try {
            if (!isSwitchLock) {
                toast.warn('درب در حال حاضر باز است !', { className: 'toast-center' });
                return
            }
            await unLockSwitch(entityID)
            setTimeout(() => {
                setIsSwitchLock(true)
            }, 2000);
            toast.success('درب باز شد', { className: 'toast-center' })

        } catch (error) {
            console.error("Failed to fetch product:", error);
            toast.error('باز کردن قفل درب با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchTurnOnFan(product) {
        const entityID = product.entity_id

        try {
            if (product.state === 'on') {
                toast.warn('فن در حال حاضر روشن است !', { className: 'toast-center' });
                return
            }
            await turnOnFan(entityID)
            await axios.put(`${url}/api/devices/${entityID}`, { state: 'on' });
            product.state = 'on'
            setProductInfo(product)
            toast.success('فن روشن شد', { className: 'toast-center' })
        } catch (err) {
            console.error(err)
            toast.error('روشن کردن فن با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchTurnOffFan(product) {
        const entityID = product.entity_id

        try {
            if (product.state === 'off') {
                toast.warn('فن در حال حاضر خاموش است !', { className: 'toast-center' });
                return
            }
            await turnOffFan(entityID)
            await axios.put(`${url}/api/devices/${entityID}`, { state: 'off' });
            product.state = 'off'
            setProductInfo(product)
            toast.success('فن خاموش شد', { className: 'toast-center' })
        } catch (err) {
            console.error(err)
            toast.error('خاموش کردن فن با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchTurnOnSmartRelay(entityID) {
        try {
            if (isSmartRelayOn) {
                toast.warn('محافظ در حال حاضر وصل است !', { className: 'toast-center' });
                return
            }
            await turnOnSmartRelay(entityID)
            toast.success('محافظ وصل شد', { className: 'toast-center' })
        } catch (err) {
            console.error(err)
            toast.error('وصل کردن محافظ با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }

    async function fetchTurnOffSmartRelay(entityID) {
        try {
            if (!isSmartRelayOn) {
                toast.warn('محافظ در حال حاضر قطع است !', { className: 'toast-center' });
                return
            }
            await turnOffSmartRelay(entityID)
            toast.success('محافظ قطع شد', { className: 'toast-center' })
        } catch (err) {
            console.error(err)
            toast.error('قطع کردن محافظ با مشکل مواجه شد', { className: 'toast-center' });
        } finally {
            setIsPending(false)
        }
    }


    const closeDetailsModal = () => {
        setIsShowDetailsModal(false)
    }


    return (
        <>
            {isUserAdmin ? (
                <div className="users-page">
                    {!selectedUser ? (
                        <>
                            <h1 className="users-title">لیست دستگاه های کاربران</h1>

                            <div className="users-list">
                                {users.map((user) => (
                                    <>
                                        {user.id !== 'ADMIN' && (
                                            <div className='users-list-div' key={user.username}>
                                                <div key={user.id} className="user-card" onClick={() => {
                                                    setSelectedUser(user)
                                                    seeUserDevicesByAdmin(user)
                                                }}
                                                >
                                                    <h3>{user.username}</h3>
                                                    <p>{user.phone}</p>
                                                </div>
                                            </div>
                                        )
                                        }
                                    </>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="user-devices-wrapper">
                            <div className="users-products-header">
                                <h1 className="users-title users-products-title">لیست دستگاه های {selectedUser.username}</h1>
                                <button
                                    className="back-btn"
                                    onClick={() => {
                                        setSelectedUser(null)
                                        setuserProductsByAdmin([])
                                    }}
                                >
                                    <EastIcon />بازگشت به لیست کاربران
                                </button>
                            </div>

                            {isPending ? (
                                <div className="pending-wrapper">
                                    <div className="dot-spinner">
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                        <div className="dot-spinner__dot"></div>
                                    </div>
                                </div>
                            ) : (userProductsByAdmin.length) ? (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>نام دستگاه</th>
                                            <th>مکان دستگاه</th>
                                            <th>عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userProductsByAdmin.map((product) => (
                                            <tr key={product.entity_id}>
                                                <td>{product.deviceName}</td>
                                                <td>{product.deviceLocationName}</td>
                                                <td className="btn-cell">
                                                    {product?.attributes?.friendly_name.startsWith("GC9 Thermo B80C GC9 Thermo B80C Temperature") && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                console.log('product', product);
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)

                                                            }}>دما</button>
                                                        </>
                                                    )}

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <>
                                    <ErrorBox msg="هیچ دستگاهی یافت نشد" />
                                </>
                            )}

                        </div>
                    )}
                </div>
            ) : (
                <>
                    <h1 className="users-title">لیست دستگاه های {username}</h1>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>نام دستگاه</th>
                                <th>مکان دستگاه</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userProducts.map((product) => (
                                <tr key={product.entity_id}>
                                    <td>{product.deviceName}</td>
                                    <td>{product.deviceLocationName}</td>
                                    <td className="btn-cell">
                                        {/* {product?.attributes?.friendly_name.startsWith("GC9 Thermo B80C GC9 Thermo B80C Temperature") && ( */}
                                        <>
                                            <button className='users-table-btn' onClick={() => {
                                                setIsShowDetailsModal(true);
                                                setProductInfo(product)
                                            }}>دما</button>
                                        </>
                                        {/* )} */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}


            {isShowDetailsModal && (
                <DetailsModal closeModal={closeDetailsModal}>
                    <div className="edit_form_wrapper">
                        {productInfo.entity_id === ("esp32_6CC840060AA8") && <Temperature temperature={sensorsData?.[productInfo.entity_id]?.temperature ?? "Loading..."} />}
                        {/* <Chart /> */}
                    </div>
                </DetailsModal>
            )}

        </>
    );

}
