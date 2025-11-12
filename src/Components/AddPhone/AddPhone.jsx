import React from 'react';
import { useForm } from 'react-hook-form';
import PhoneIcon from '@mui/icons-material/Phone';
import './AddPhone.css';

const AddPhone = () => {
    const { register, handleSubmit, formState } = useForm();

    const onSubmit = (data) => {
        const filledPhones = Object.values(data).filter(num => num.trim() !== '');
        console.log("شماره‌های وارد شده:", filledPhones);
    };


    return (
        <div className='phones-main'>
            <h1 className='phones-title'>ثبت شماره تماس</h1>

            <form onSubmit={handleSubmit(onSubmit)} className='add-phones-form' noValidate>
                <div className='add-phones-form-wrap'>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className='add-phones-form-group'>
                            <PhoneIcon className='input-icon' />
                            <div className="input-wrapper">
                                <input
                                    type="tel"
                                    {...register(`phone${i}`, {
                                        // required: "این فیلد الزامی است",
                                        pattern: {
                                            value: /^09\d{9}$/,
                                            message: "شماره موبایل معتبر نیست"
                                        }
                                    })}
                                    className="add-phones-input"
                                />
                                <label>شماره تماس {i}</label>
                            </div>
                        </div>
                    ))}
                </div>

                <button type='submit' className='add-phones-submit'>
                    ثبت شماره‌ها
                </button>
            </form>
        </div>
    );
};

export default AddPhone;
