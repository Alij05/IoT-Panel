import axios from "axios"
import { createConnection, createLongLivedTokenAuth } from "home-assistant-js-websocket"
import { toast } from "react-toastify"

const BASE_URL = process.env.REACT_APP_HA_BASE_URL
const TOKEN = process.env.REACT_APP_HA_TOKEN

let connection = null

export async function initHAConnection() {
    if (!connection) {
        const auth = createLongLivedTokenAuth(BASE_URL, TOKEN)
        connection = await createConnection({ auth })
    }

    return connection
}


export async function getEntities() {
    const res = await axios.get(`${BASE_URL}/api/states`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        },
    })

    return res
}


// export async function getEntityById(entityID) {
//     const res = await axios.get(`${BASE_URL}/api/states/${entityID}`, {
//         headers: {
//             Authorization: `Bearer ${TOKEN}`,
//             "Content-Type": "application/json",
//         },
//     })

//     return res
// }


export async function turnOffSwitch(deviceId, deviceType, state) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${BASE_URL}/api/control`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceType, deviceId, command: state })
    });

    return res

}

export async function turnOnSwitch(deviceId, deviceType, state) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${BASE_URL}/api/control`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceType, deviceId, command: state })
    });

    return res

}


export async function lockSwitch(entityID) {
    const res = await axios.post(`${BASE_URL}/api/services/switch/turn_off`, {
        entity_id: entityID
    }, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        }
    })

}

export async function unLockSwitch(entityID) {
    const res = await axios.post(`${BASE_URL}/api/services/switch/turn_on`, {
        entity_id: entityID
    }, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        }
    })

}


export async function getEntityHistory(entityId, date = new Date()) {
    try {
        const timestamp = date.toISOString().split('T')[0];
        const url = `${BASE_URL}/api/history/period/${timestamp}?filter_entity_id=${entityId}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("تاریخچه state برای", entityId, ":", response.data);
        return response.data[0]; // چون پاسخ یک آرایه از آرایه‌هاست
    } catch (error) {
        console.error("خطا در دریافت تاریخچه entity:", error);
        return [];
    }
}


export async function turnOnFan(entityID) {
    try {
        const res = axios.post(`${BASE_URL}/api/services/switch/turn_on`, {
            entity_id: entityID
        }, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

    } catch (err) {
        toast.error('Error')
    }
}


export async function turnOffFan(entityID) {
    try {
        const res = axios.post(`${BASE_URL}/api/services/switch/turn_off`, {
            entity_id: entityID
        }, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

    } catch (err) {
        toast.error('Error')
    }
}

export async function turnOnSmartRelay(entityID) {
    try {
        const res = axios.post(`${BASE_URL}/api/services/switch/turn_on`, {
            entity_id: entityID
        }, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

    } catch (err) {
        toast.error('Error')
    }
}


export async function turnOffSmartRelay(entityID) {
    try {
        const res = axios.post(`${BASE_URL}/api/services/switch/turn_off`, {
            entity_id: entityID
        }, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

    } catch (err) {
        toast.error('Error')
    }
}