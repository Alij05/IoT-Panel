import React from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function Humadity({ humidity = 0 }) {
    const humidityData = [
        {
            name: 'Humidity',
            value: humidity,
            fill: '#26c6da',
        },
    ]

    return (
        <div className='details-products-form-group humadity-card'>
            <div style={{ width: '100%', height: 250, position: 'relative' }}>
                <ResponsiveContainer>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={20} data={humidityData} startAngle={180} endAngle={0}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background clockWise dataKey="value" cornerRadius={10} angleAxisId={0} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', fontWeight: 'bold', color: '#26c6da', }}>
                    رطوبت: {humidity}٪
                </div>
            </div>
        </div>
    );
}
