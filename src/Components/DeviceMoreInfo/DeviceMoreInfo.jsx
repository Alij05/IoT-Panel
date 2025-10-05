import React from 'react'
import { toJalaliDateString } from '../DeviceReport/DateUtils'

function DeviceMoreInfo({ deviceInfo, product }) {
    return (
        <>
            <tr><td>شناسه دیوایس :</td><td>{deviceInfo?.deviceId || deviceInfo?.device_Id}</td></tr>
            <tr><td>نوع دیوایس :</td><td>{deviceInfo?.deviceType || 'سنسور'}</td></tr>
            <tr><td>کلاس دیوایس :</td><td>{product?.device_class || product?.deviceClass}</td></tr>
            <tr><td>نام دیوایس :</td><td>{product?.deviceName}</td></tr>
            <tr><td>مکان :</td><td>{product?.deviceLocationName}</td></tr>
            <tr><td>مالک :</td><td>{product?.user}</td></tr>
            <tr><td>باتری :</td><td>{deviceInfo?.battery_percent}%</td></tr>
            <tr><td>در حال شارژ :</td><td>{deviceInfo?.battery_charging ? 'بلی' : 'خیر'}</td></tr>
            <tr><td>ولتاژ باتری :</td><td>{(deviceInfo?.battery_v)?.toFixed(2)} ولت</td></tr>
            <tr><td>قدرت سیگنال wifi :</td><td>{deviceInfo?.rssi}</td></tr>
            <tr><td>نام شبکه (SSID) :</td><td>{deviceInfo?.ssid}</td></tr>
            <tr><td>IP :</td><td>{deviceInfo?.ip}</td></tr>
            <tr><td>فضای آزاد SD Card:</td><td>{deviceInfo?.heap_free} مگابایت</td></tr>
            <tr><td>مدت زمان فعالیت :</td><td>{(deviceInfo?.uptime_ms / 60)?.toFixed(0)} دقیقه</td></tr>
            <tr><td>تاریخ و زمان :</td><td>{toJalaliDateString(deviceInfo?.timestamp)}</td></tr>
        </>
    )
}

export default DeviceMoreInfo