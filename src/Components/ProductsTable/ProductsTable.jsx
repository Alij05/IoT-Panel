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
import { getEntities, getEntityById, getEntityHistory, lockSwitch, turnOffFan, turnOffSmartRelay, turnOffSwitch, turnOnFan, turnOnSmartRelay, turnOnSwitch, unLockSwitch } from '../../Services/HomeAssistantConnection'
import { toast } from 'react-toastify'
import WaterMoistureStatus from '../Cards/WaterMoistureStatus'
import EastIcon from '@mui/icons-material/East';
import { useAuth } from '../../Contexts/AuthContext'
import axios from 'axios'
import { useSockets } from '../../Contexts/SocketProvider'
import CameraCard from '../HomeCards/CameraCard'
import MotionStatus from '../Cards/MotionStatus'
import FlameStatus from '../Cards/FlameStatus'


const url = process.env.REACT_APP_URL

export default function ProductsTable() {

    const { sensorsData } = useSockets();


    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);

    const [userProducts, setUserProducts] = useState([])
    const [userProductsByAdmin, setuserProductsByAdmin] = useState([])
    const [productInfo, setProductInfo] = useState([])
    const [isShowDetailsModal, setIsShowDetailsModal] = useState(false)
    const [isPending, setIsPending] = useState(true)
    const [deleteProductInfo, setDeleteProductInfo] = useState({})
    const [isShowDeleteModal, setIsShowDeleteModal] = useState(false)


    const [isSwitchOn, setIsSwitchOn] = useState(null)

    const [isSmartRelayOn, setIsSmartRelayOn] = useState(null)
    const [isSwitchLock, setIsSwitchLock] = useState(true)
    const { isUserAdmin, username } = useAuth()


    useEffect(() => {
        getUserProducts()
        getUsers()
    }, [])


    const getUsers = () => {
        if (isUserAdmin) {
            axios.get(`${url}/api/auth/users`)
                .then(res => {
                    setUsers(res.data)
                    setIsPending(false)
                    // contextData.setSearchSourceData(res.data)
                })
        }
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

    async function fetchTurnOffLight(product) {
        const deviceId = product.entity_id;
        const deviceType = product.deviceType || 'sensor'
        const deviceState = deviceId ? sensorsData?.[deviceId]?.state : null;

        try {
            // if (product?.state == 'off') {
            if (deviceState === 'off') {
                toast.warn('لامپ در حال حاضر خاموش است !', { className: 'toast-center' });
                return
            }
            const res = await turnOffSwitch(deviceId, deviceType, 'off')

            if (res.status === 200) {
                product.state = 'off'
                setProductInfo(product)
                toast.success('لامپ خاموش شد', { className: 'toast-center' });
                await axios.put(`${url}/api/devices/${deviceId}`, { state: 'off' });  // Update State in Database

            }
        } catch (error) {
            console.error("Failed to turn on light:", error.response || error);
            if (error.response && error.response.status === 403) {
                toast.error('دسترسی غیرمجاز. لطفاً وارد شوید', { className: 'toast-center' });
            } else {
                toast.error('خاموش کردن لامپ با مشکل مواجه شد', { className: 'toast-center' });
            }
        } finally {
            setIsPending(false)
        }
    }

    async function fetchTurnOnLight(product) {
        const deviceId = product.entity_id;
        const deviceType = product.deviceType || 'sensor'
        const deviceState = deviceId ? sensorsData?.[deviceId]?.state : null;

        try {
            // if (product?.state == 'on') {
            if (deviceState === 'on') {
                toast.warn('لامپ در حال حاضر روشن است !', { className: 'toast-center' });
                return
            }
            const res = await turnOnSwitch(deviceId, deviceType, 'on')

            if (res.status === 200) {
                product.state = 'on'
                setProductInfo(product)
                toast.success('لامپ روشن شد', { className: 'toast-center' });
                await axios.put(`${url}/api/devices/${deviceId}`, { state: 'on' });  // Update State in Database
            }
        } catch (error) {
            console.error("Failed to turn on light:", error.response || error);
            if (error.response && error.response.status === 403) {
                toast.error('دسترسی غیرمجاز. لطفاً وارد شوید', { className: 'toast-center' });
            } else {
                toast.error('روشن کردن لامپ با مشکل مواجه شد', { className: 'toast-center' });
            }
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

    async function deleteProductHandler(product) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("توکن یافت نشد. لطفاً دوباره وارد شوید.", { className: 'toast-center' });
                return;
            }

            const res = await axios.post(
                `${url}/api/devices/delete/${product.entity_id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.status === 200) {
                toast.success("دستگاه با موفقیت حذف شد.", { className: 'toast-center' });
                setUserProducts(prev => prev.filter(p => p.entity_id !== product.entity_id));
                closeDeleteModal();
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    toast.error("توکن نامعتبر یا منقضی شده است. لطفاً دوباره وارد شوید.", { className: 'toast-center' });
                } else if (status === 403) {
                    toast.warn("شما اجازه حذف این دستگاه را ندارید.", { className: 'toast-center' });
                } else if (status === 404) {
                    toast.error("دستگاه مورد نظر یافت نشد.", { className: 'toast-center' });
                } else {
                    toast.error("خطای ناشناخته‌ای رخ داد.", { className: 'toast-center' });
                }
            } else {
                toast.error("خطا در ارتباط با سرور.", { className: 'toast-center' });
                console.error("Error deleting device:", error);
            }
        }
    }


    const closeDeleteModal = () => {
        setIsShowDeleteModal(false)
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
                                                    {product?.deviceClass === 'light' && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)
                                                            }}>نمایش</button>
                                                            <button className='users-table-btn' onClick={() => {
                                                                fetchTurnOnLight(product)
                                                                setProductInfo(product)
                                                            }}>روشن</button>
                                                            <button className='users-table-btn' onClick={() => {
                                                                fetchTurnOffLight(product)
                                                                setProductInfo(product)
                                                            }}>خاموش</button>
                                                        </>
                                                    )}

                                                    {product?.deviceClass === 'flame' && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)
                                                            }}>شعله</button>
                                                        </>
                                                    )}

                                                    {product?.deviceClass === 'motion' && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)
                                                            }}>حرکت</button>
                                                        </>
                                                    )}

                                                    {product?.deviceClass === 'temperature' && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)
                                                            }}>دما و رطوبت</button>
                                                        </>
                                                    )}

                                                    {product?.deviceClass === 'water' && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)
                                                            }}>وضعیت</button>
                                                        </>
                                                    )}

                                                    {product?.deviceClass === 'camera' && (
                                                        <>
                                                            <button className='users-table-btn' onClick={() => {
                                                                setIsShowDetailsModal(true);
                                                                setProductInfo(product)
                                                            }}>دوربین</button>
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
                                <th>حذف دستگاه</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userProducts.map((product) => (
                                <tr key={product.entity_id}>
                                    <td>{product.deviceName}</td>
                                    <td>{product.deviceLocationName}</td>
                                    <td className="btn-cell">
                                        {product?.deviceClass === 'light' && (
                                            <>
                                                <button className='users-table-btn' onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product)
                                                }}>نمایش</button>
                                                <button className='users-table-btn' onClick={() => {
                                                    fetchTurnOnLight(product)
                                                    setProductInfo(product)
                                                    // fetchEntityById(product.data.entity_id)
                                                }}>روشن</button>
                                                <button className='users-table-btn' onClick={() => {
                                                    fetchTurnOffLight(product)
                                                    setProductInfo(product)
                                                    // fetchEntityById(product.data.entity_id)
                                                }}>خاموش</button>
                                            </>
                                        )}

                                        {product?.deviceClass === 'flame' && (
                                            <>
                                                <button className='users-table-btn' onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product)
                                                }}>شعله</button>
                                            </>
                                        )}

                                        {product?.deviceClass === 'motion' && (
                                            <>
                                                <button className='users-table-btn' onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product)
                                                }}>حرکت</button>
                                            </>
                                        )}

                                        {product?.deviceClass === 'temperature' && (
                                            <>
                                                <button className='users-table-btn' onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product)
                                                }}>دما و رطوبت</button>
                                            </>
                                        )}

                                        {product?.deviceClass === 'water' && (
                                            <>
                                                <button className='users-table-btn' onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product)
                                                }}>وضعیت</button>
                                            </>
                                        )}

                                        {product?.deviceClass === 'camera' && (
                                            <>
                                                <button className='users-table-btn' onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product)
                                                }}>دوربین</button>
                                            </>
                                        )}

                                    </td>
                                    <td>
                                        <button className='users-table-btn red-delete-btn' onClick={(e) => {
                                            setIsShowDeleteModal(true)
                                            setDeleteProductInfo(product)
                                            // deleteProductHandler(product)
                                        }
                                        }> حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="users-mobile-view">
                        {userProducts.map((product) => (
                            <div className="user-card-mobile" key={product.entity_id}>
                                <h3>{product.deviceName}</h3>
                                <p>{product.deviceLocationName}</p>

                                <div className="mobile-btns">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>

                                        {product?.deviceClass === 'light' && (
                                            <>
                                                <button className="users-table-btn" onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product);
                                                }}
                                                >
                                                    نمایش
                                                </button>
                                                <button className="users-table-btn" onClick={() => {
                                                    fetchTurnOnLight(product);
                                                    setProductInfo(product);
                                                }}
                                                >
                                                    روشن
                                                </button>
                                                <button className="users-table-btn" onClick={() => {
                                                    fetchTurnOffLight(product);
                                                    setProductInfo(product);
                                                }}
                                                >
                                                    خاموش
                                                </button>
                                            </>
                                        )}

                                        {product?.deviceClass === 'flame' && (
                                            <button
                                                className="users-table-btn"
                                                onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product);
                                                }}
                                            >
                                                شعله
                                            </button>
                                        )}

                                        {product?.deviceClass === 'motion' && (
                                            <button
                                                className="users-table-btn"
                                                onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product);
                                                }}
                                            >
                                                حرکت
                                            </button>
                                        )}

                                        {product?.deviceClass === 'temperature' && (
                                            <button
                                                className="users-table-btn"
                                                onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product);
                                                }}
                                            >
                                                دما و رطوبت
                                            </button>
                                        )}

                                        {product?.deviceClass === 'water' && (
                                            <button
                                                className="users-table-btn"
                                                onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product);
                                                }}
                                            >
                                                وضعیت
                                            </button>
                                        )}

                                        {product?.deviceClass === 'camera' && (
                                            <button
                                                className="users-table-btn"
                                                onClick={() => {
                                                    setIsShowDetailsModal(true);
                                                    setProductInfo(product);
                                                }}
                                            >
                                                دوربین
                                            </button>
                                        )}
                                    </div>

                                    <div className="delete-btn-wrapper">
                                        <button
                                            className="users-table-btn red-delete-btn"
                                            onClick={() => deleteProductHandler(product)}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </>
            )
            }


            {
                isShowDetailsModal && (() => {
                    const deviceId = productInfo.entity_id;
                    const deviceState = deviceId ? sensorsData?.[deviceId]?.state : null;

                    return (
                        <DetailsModal closeModal={closeDetailsModal}>
                            <div className="edit_form_wrapper">
                                {productInfo?.deviceClass === "light" && (
                                    <LightControl deviceState={deviceState} />
                                )}

                                {productInfo?.deviceClass === "water" && (
                                    <WaterMoistureStatus deviceState={deviceState} />
                                )}

                                {productInfo?.deviceClass === "temperature" && (
                                    <>
                                        <Temperature deviceState={deviceState} product={productInfo} />
                                        <Humadity deviceState={deviceState} product={productInfo} />
                                    </>
                                )}

                                {productInfo?.deviceClass === "motion" && (
                                    <MotionStatus product={productInfo} deviceState={deviceState} />
                                )}

                                {productInfo?.deviceClass === "flame" && (
                                    <FlameStatus product={productInfo} deviceState={deviceState} />
                                )}

                                {productInfo?.deviceClass === "camera" && (
                                    <CameraCard cameraId={productInfo.entity_id} deviceState={deviceState} />
                                )}
                            </div>
                        </DetailsModal>
                    );
                })()
            }

            {
                isShowDeleteModal && (<DeleteModal closeModal={closeDeleteModal} submitModal={() => deleteProductHandler(deleteProductInfo)} msg="آیا میخواهید دستگاه را حذف کنید؟" />)
            }
        </>
    );

}
