import axios from "axios";
const url = process.env.REACT_APP_URL


// export const isAdmin = () => {
//     return true
// }

// export const isLoggedIn = async (token) => {
//     try {
//         const res = await axios.post(`${url}/api/auth/homescreen`,
//             {},
//             {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             }
//         );
//         console.log(res);
//         document.body.classList.remove('auth-body')
//         return res.data.isLogin

//     } catch (err) {
//         console.log(err.response?.data || err.message);
//     }

// }