import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const url = process.env.REACT_APP_URL

const initialState = {
  username: '',
  password: '',
  nationalId: '',
  phone: '',
  otp: ''
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    case 'RESET_OTP':
      return { ...state, otp: '' };
    default:
      return state;
  }
}

export default function Register() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showOtp, setShowOtp] = useState(false)
  const [timer, setTimer] = useState(120)
  const [showResend, setShowResend] = useState(false)
  const navigate = useNavigate();


  useEffect(() => {
    let interval;

    if (timer === 0) {
      setShowResend(true)
    }

    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [showOtp, timer]);


  const handleChange = (field) => (e) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  };

  const handleNumberFieldChange = (field) => (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      dispatch({ type: 'SET_FIELD', field, value });
    }
  };

  const handleKeyDown = (e) => {
    if (
      !/^\d$/.test(e.key) &&
      !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    if (!/^\d+$/.test(paste)) {
      e.preventDefault();
    }
  };

  const registerHandler = async (event) => {
    event.preventDefault()
    const { username, password, nationalId, phone } = state;

    if (!username || !password || !nationalId || !phone) {
      toast.warn('لطفا همه فیلدها را پر کنید', { className: 'toast-center' });
      return;
    }

    if (nationalId.length !== 10) {
      toast.error('کد ملی باید 10 رقم باشد', { className: 'toast-center' });
      return;
    }

    if (phone.length !== 11) {
      toast.error('شماره تماس باید 11 رقم باشد', { className: 'toast-center' });
      return;
    }

    try {
      // مرحله ۱: چک کردن کد ملی با شماره تلفن (Shahkar API)
      const idVerifyRes = await axios.post(`${url}/api/auth/idverify`, {
        nationalCode: nationalId,
        phone
      });

      // مرحله ۲: ثبت نام اگر مرحله اول موفقیت‌آمیز بود
      const registerRes = await axios.post(`${url}/api/auth/register`, {
        username,
        password,
        nationalCode: nationalId,
        phone,
        token: idVerifyRes.data.token
      });

      if (registerRes.status === 200) {
        setShowOtp(true);
        toast.success('کد تایید ارسال شد', { className: 'toast-center' });
      }

    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('کد ملی با شماره تماس تطابق ندارد', { className: 'toast-center' });
          dispatch({ type: 'RESET' });
        } else if (error.response.status === 400) {
          toast.error('مقددار ورودی معتبر نیست !', { className: 'toast-center' });
          dispatch({ type: 'RESET' });
        } else {
          toast.error('Error !', { className: 'toast-center' });
        }
      } else {
        toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
      }
    }
  };

  const OTPHandler = async () => {
    if (state.otp.length === 6) {
      try {
        const res = await axios.post(`${url}/api/auth/registersubmit`, {
          phone: state.phone,
          otp: state.otp
        })

        if (res.status === 200) {
          document.body.classList.remove('auth-body')
          toast.success('ثبت نام با موفقیت انجام شد', { className: 'toast-center' })
          localStorage.setItem('token', JSON.stringify(res.token))
          navigate('/login')
        }

      } catch (err) {
        if (err.response.status === 400) {
          toast.error('کد تایید وارد شده اشتباه است', { className: 'toast-center' });
          dispatch({ type: 'RESET_OTP' });
        }
        else {
          toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
          dispatch({ type: 'RESET_OTP' });
        }
      }

    } else {
      toast.warn('لطفا کد تایید 6 رقمی را وارد کنید', { className: 'toast-center' })
      dispatch({ type: 'RESET_OTP' });
    }
  }


  const reSendOTPHandler = async () => {
    // Resend API
    const { phone } = state;

    try {
      const res = await axios.post(`${url}/api/auth/resendotp`, {
        phone
      })

      if (res.status === 200) {
        toast.success('کد تایید مجدد ارسال شد', { className: 'toast-center' });
      }

    } catch (err) {
      toast.error('ارسال مجدد کد تایید با مشکل مواجه شد', { className: 'toast-center' });
    }
  }



  return (
    <>
      {!showOtp && (

        <div className='login-form-container'>
          <div className="login wrap">
            <div className="h1">ایجاد حساب</div>
            <form onSubmit={registerHandler}>
              <div className="register-inputs-wrapper">

                <div className="form-group">
                  <input type="text" className="form-control" id="username" placeholder=" " value={state.username}
                    onChange={handleChange('username')}
                  />
                  <label htmlFor="username" className="form-label">نام کاربری</label>
                </div>

                <div className="form-group">
                  <input type="password" className="form-control" id="password" placeholder=" " value={state.password}
                    onChange={handleChange('password')}
                  />
                  <label htmlFor="password" className="form-label">رمز عبور</label>
                </div>

                <div className="form-group">
                  <input type="text" className="form-control" id="nationalCode" placeholder=" " value={state.nationalId} maxLength="10" inputMode="numeric"
                    onChange={handleNumberFieldChange('nationalId')}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                  />
                  <label htmlFor="nationalCode" className="form-label">کد ملی</label>
                </div>

                <div className="form-group">
                  <input type="text" className="form-control" id="phoneNumber" placeholder=" " value={state.phone} maxLength="11" inputMode="numeric"
                    onChange={handleNumberFieldChange('phone')}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                  />
                  <label htmlFor="phoneNumber" className="form-label">شماره تماس</label>
                </div>
              </div>

              <button className='button-modern'>ثبت نام</button>
            </form>
            {/* <button className='button-modern' onClick={(event) => {
                event.preventDefault()
                registerHandler()
              }
              }>ثبت نام</button> */}

            <p className='login-footer-text'>
              حساب کاربری دارید؟ <Link to='/login'>وارد شوید</Link>
            </p>
          </div>
        </div >
      )
      }

      {/* OTP */}
      {
        showOtp && (
          <div className='login-form-container'>
            <div className="login wrap">
              <div className="h1">کد تایید</div>

              <div className='otp-inputs-wrapper'>
                <div className="form-group" id="otpNumber">
                  <input type="text" className="form-control" placeholder="" maxLength={6} value={state.otp} onChange={handleNumberFieldChange('otp')} />
                  <label htmlFor="passwordNumber" className="form-label">کد</label>
                </div>
              </div>
              <button className='button-modern' style={{ marginTop: '20px' }} onClick={OTPHandler}>ارسال</button>
              <div className='timer-wrapper'>
                <p className='otp-footer-text' style={{ cursor: 'pointer' }}><Link onClick={(event) => {
                  event.preventDefault()
                  setShowOtp(false)
                }
                }>بازگشت</Link></p>

                {showResend ? (
                  <button
                    className="button-outline-cool"
                    onClick={() => {
                      // Resend API
                      reSendOTPHandler()
                      setShowResend(false);
                      setTimer(120);
                    }}
                  >
                    ارسال مجدد
                  </button>
                ) : (
                  <div>
                    {timer} ثانیه
                  </div>
                )}
              </div>
            </div>

          </div>
        )
      }
    </>
  );
}
