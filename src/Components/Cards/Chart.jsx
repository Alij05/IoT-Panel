import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { time: '10:00', value: 21 },
    { time: '10:10', value: 24 },
    { time: '10:20', value: 21 },
    { time: '10:30', value: 28 },
    { time: '10:40', value: 24 },
    { time: '10:50', value: 26 },
    { time: '11:00', value: 28 },
];

export default function Chart() {
    return (
        <div className='details-products-form-group chart-card'>
            <div style={{ width: 500, height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" fontSize={10} tick={{ dy: 6 }} interval={0} tickLine={false} axisLine={{ stroke: 'var(--white)' }} />
                        <YAxis domain={[0, 30]} fontSize={10} tick={{ dx: -4 }} tickLine={false} axisLine={{ stroke: 'var(--white)' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#26c6da" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
