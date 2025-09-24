import React from 'react'
import './Support.css'
import PhoneEnabledRoundedIcon from '@mui/icons-material/PhoneEnabledRounded';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Support() {
    return (
        <div className='products-main'>
            <h1 className='products-title'>پشتیبانی</h1>

            <form action="#" className='add-support-form'>
                <div className='support-question-wrapper'>
                    <textarea id="support-question" placeholder='متن خود را وارد کنید...'></textarea>
                    {/* <button className='add-products-submit'>ارسال</button> */}
                    <button className="add-products-submit">
                        <span className="shadow"></span>
                        <span className="edge"></span>
                        <span className="front text">ارسال</span>
                    </button>
                </div>
                <div className='support-infos'>
                    <div className="support-phone">
                        <PhoneEnabledRoundedIcon />
                        <a href="tel:021-88171622">
                            شماره تماس : 88171622-021
                        </a>
                    </div>
                    <div className="support-phone">
                        <EmailIcon />
                        <p>ایمیل : info@pars-pardaz.com</p>
                    </div>
                    <div className="support-phone">
                        <LocationOnIcon />
                        <p>آدرس : ایران، ‌تهران، خیابان سهروردی، ‌کوچه نقدی، پلاک ۲۷</p>
                    </div>
                </div>
            </form>
        </div>
    )
}
