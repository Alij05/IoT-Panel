import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Captcha from './../Captcha/Captcha'
import zxcvbn from "zxcvbn";

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
  const [passwordScore, setPasswordScore] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState("")
  const [cloudflareCaptchaToken, setCloudflareCaptchaToken] = useState("");
  const [otpCaptchaToken, setOtpCaptchaToken] = useState("");

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

    // اضافه کردن محاسبه امنیت پسورد
    if (field === "password") {
      const result = zxcvbn(e.target.value)
      setPasswordScore(result.score)
      setPasswordFeedback(result.feedback.warning || "")
    }

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
    event.preventDefault();

    const { username, password, nationalId, phone } = state;

    if (!cloudflareCaptchaToken) {
      toast.warn('لطفاً کپچا را حل کنید', { className: 'toast-center' });
      return;
    }

    if (!username || !password || !nationalId || !phone) {
      toast.warn('لطفا همه فیلدها را پر کنید', { className: 'toast-center' });
      return;
    }

    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!minLength || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      toast.error('رمز عبور باید حداقل ۸ کاراکتر و شامل حروف بزرگ، کوچک، عدد و کاراکتر خاص باشد', { className: 'toast-center' });
      return;
    }

    // --- بررسی پیچیدگی پسورد با zxcvbn ---
    const passwordResult = zxcvbn(password);
    if (passwordResult.score <= 2) {
      toast.error('پسورد ایمن نیست. از پسورد پیچیده‌تر استفاده کنید.', { className: 'toast-center' });
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
        token: idVerifyRes.data.token,
        cloudflareCaptchaToken   // <-- ارسال توکن کپچا به سرور
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
          toast.error('مقدار ورودی معتبر نیست!', { className: 'toast-center' });
          dispatch({ type: 'RESET' });
        } else if (error.response.status === 422) {
          toast.error('اعتبارسنجی کپچا ناموفق بود', { className: 'toast-center' });
        } else {
          toast.error('خطای سرور', { className: 'toast-center' });
        }
      } else {
        toast.error('خطای اتصال به سرور یا شبکه', { className: 'toast-center' });
      }
    }
  }


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

                  {state.password && (
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ height: '6px', width: '95%', backgroundColor: '#ddd', borderRadius: '3px', overflow: 'hidden', margin: '0 auto' }}>
                        <div style={{
                          width: `${(passwordScore + 1) * 20}%`,
                          height: '100%',
                          backgroundColor:
                            passwordScore === 0 ? '#ff4d4d' :
                              passwordScore === 1 ? '#ff944d' :
                                passwordScore === 2 ? '#ffcc00' :
                                  passwordScore === 3 ? '#99e600' : '#00cc44',
                          transition: '0.3s'
                        }} />
                      </div>
                    </div>
                  )}

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

              <Captcha onVerify={(token) => setCloudflareCaptchaToken(token)} />

              <button className='button-modern' style={{ marginTop: "20px" }}>ثبت نام</button>
            </form>

            <p className='login-footer-text'>
              حساب کاربری دارید؟ <Link to='/login'>وارد شوید</Link>
            </p>
          </div>
        </div>
      )}

      {/* OTP */}
      {showOtp && (
        <div className='login-form-container'>
          <div className="login wrap">
            <div className="h1">کد تایید</div>

            <div className='otp-inputs-wrapper'>
              <div className="form-group" id="otpNumber">
                <input type="text" className="form-control" placeholder="" maxLength={6}
                  value={state.otp} onChange={handleNumberFieldChange('otp')}
                />
                <label htmlFor="passwordNumber" className="form-label">کد</label>
              </div>
            </div>

            {/* --- کپچا OTP --- */}
            {/* <Captcha onVerify={(token) => setOtpCaptchaToken(token)} /> */}

            <button className='button-modern' style={{ marginTop: '20px' }} onClick={OTPHandler}>ارسال</button>

            <div className='timer-wrapper'>
              <p className='otp-footer-text' style={{ cursor: 'pointer' }}>
                <Link onClick={(event) => {
                  event.preventDefault()
                  setShowOtp(false)
                }}>
                  بازگشت
                </Link>
              </p>

              {showResend ? (
                <button
                  className="button-outline-cool"
                  onClick={() => {
                    reSendOTPHandler()
                    setShowResend(false);
                    setTimer(120);
                  }}
                >
                  ارسال مجدد
                </button>
              ) : (
                <div>{timer} ثانیه</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

}
