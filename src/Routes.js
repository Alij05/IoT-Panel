import { Navigate } from 'react-router-dom';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import PanelLayout from './Layouts/PanelLayouts';
import AuthLayout from './Layouts/AuthLayouts';

import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Home from './Components/Home/Home';
import Users from './Components/Users/Users';
import AddNewUser from './Components/AddNewUser/AddNewUser';
import Products from './Components/Products/Products';
import AddNewProduct from './Components/AddNewProduct/AddNewProduct';
import Support from './Components/Support/Support';
import Reports from './Components/Reports/Reports';
import Notifications from './Components/Notifications/Notifications';
import AddPhone from './Components/AddPhone/AddPhone';
import Settings from './Components/Settings/Settings';


const adminRoutes = [
    { path: 'users', element: <PrivateRoute adminOnly={true}><Users /></PrivateRoute> },
    { path: 'add-user', element: <PrivateRoute adminOnly={true}><AddNewUser /></PrivateRoute> },
];

const userRoutes = [
    { path: 'home', element: <PrivateRoute><Home /></PrivateRoute> },
    { path: 'products', element: <PrivateRoute><Products /></PrivateRoute> },
    { path: 'add-product', element: <PrivateRoute><AddNewProduct /></PrivateRoute> },
    { path: 'add-phone', element: <PrivateRoute><AddPhone /></PrivateRoute> },
    { path: 'support', element: <PrivateRoute><Support /></PrivateRoute> },
    { path: 'reports', element: <PrivateRoute><Reports /></PrivateRoute> },
    { path: 'notifs', element: <PrivateRoute><Notifications /></PrivateRoute> },
    { path: 'settings', element: <PrivateRoute><Settings /></PrivateRoute> },
];

const routes = [
    {
        path: '/',
        element: <Navigate to="/home" replace /> // اگر لاگین باشه → Home
    },
    {
        path: '/',
        element: <PrivateRoute><PanelLayout /></PrivateRoute>,
        children: [...userRoutes, ...adminRoutes],
    },
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
        ],
    },
];

export default routes;
