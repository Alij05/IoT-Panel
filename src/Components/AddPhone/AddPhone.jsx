import React from 'react';
import { useForm } from 'react-hook-form';
import { Phone } from 'lucide-react';
import './AddPhone.css';

const AddPhone = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const onSubmit = (data) => {
        const filledPhones = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value?.trim() ? `+98${value?.trim()}` : null;
            return acc;
        }, {});

        console.log(filledPhones);
    };


    return (
        <div className='phones-main'>
            <h1 className='phones-title'>ثبت شماره تماس</h1>

            <form className='add-phones-form' onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className='add-phones-form-wrap'>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className='add-phones-form-group'>
                            <Phone className='input-icon' size={20} />
                            <div className="input-wrapper">
                                <span className="input-prefix">98+</span>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    {...register(`phone${i}`, {
                                        validate: value => !value || /^9\d{9}$/.test(value) || "شماره موبایل معتبر نیست"
                                    })}
                                    className="add-phones-input"
                                />

                                <label className={watch(`phone${i}`) ? 'filled' : ''}>شماره تماس {i}</label>

                                {errors[`phone${i}`] && (
                                    <span className="error-message">{errors[`phone${i}`].message}</span>
                                )}
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
