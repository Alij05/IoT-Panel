import { Outlet, useNavigate, useRoutes } from 'react-router-dom'
import Sidebar from '../Components/Sidebar/Sidebar'
import Header from '../Components/Header/Header'
import ThemeProvider from '../Contexts/ThemeContexts'
import SearchProvider from '../Contexts/SearchContext'
import { ToastContainer } from 'react-toastify'
import routes from '../Routes'
import MobileMenuProvider from '../Contexts/MobileMenuContext'
import ProductsProvider from '../Contexts/ProductsContext'
import FlameAlert from '../Components/Cards/FlameAlert'
import { useEffect } from 'react'
import axios from 'axios'
import useUsersStore from '../Store/usersStore'
import useDeviceStatusStore from '../Store/deviceStateStore'
import { useAuth } from '../Contexts/AuthContext'
import useProductStore from '../Store/productStore'
import { WebSocketProvider } from '../Contexts/SocketProvider'

const url = process.env.REACT_APP_URL

export default function PanelLayout() {

    const navigate = useNavigate();
    const setAllUsers = useUsersStore((state) => state.setAllUsers)
    const { setProducts } = useProductStore()

    const { isUserLoggedIn } = useAuth()



    const { isUserAdmin } = useAuth()

    // Send Token to Backend
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
        }

        getHomeScreenUser()
        getUsers()
        getAllDevices()

    }, [navigate]);

    //! Previous Function
    // async function getHomeScreenUser() {
    //     const token = localStorage.getItem('token')

    //     try {
    //         const res = await axios.post(`${url}/api/auth/homescreen`,
    //             {},
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         if (!res.data.isLogin) {
    //             navigate('/login')
    //         }
    //     } catch (err) {
    //         console.log(err.response?.data || err.message);
    //     }
    // }

    async function getHomeScreenUser() {
        if (!isUserLoggedIn) {
            navigate('/login')
        }
    }

    const getUsers = () => {
        if (isUserAdmin) {
            axios.get(`${url}/api/auth/users`)
                .then(res => {
                    setAllUsers(res.data)
                })
        }
    }

    const getAllDevices = async () => {
        const token = localStorage.getItem('token')

        if (isUserAdmin) {
            try {
                const res = await axios.get(`${url}/api/devices`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (res.status === 200) {
                    setProducts(res.data)
                }

            } catch (err) {
                console.log(err);
            }

        } else {
            try {
                const res = await axios.get(`${url}/api/devices/mine`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (res.status === 200) {
                    setProducts(res.data)
                }

            } catch (err) {
                console.log(err);
            }
        }
    }


    return (
        <WebSocketProvider>
            <ThemeProvider>
                <MobileMenuProvider>
                    <SearchProvider>
                        <ProductsProvider>
                            <div className="container">
                                <Sidebar />
                                <div className="main">
                                    <Header />
                                    {/* Show Flame Alert in All Pages When Flame is Detected*/}
                                    <FlameAlert />

                                    <Outlet />
                                </div>
                            </div>
                            <ToastContainer position="top-center" />
                        </ProductsProvider>
                    </SearchProvider>
                </MobileMenuProvider>
            </ThemeProvider>
        </WebSocketProvider>
    )
}
