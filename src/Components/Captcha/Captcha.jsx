import React from "react";
import Turnstile from "react-turnstile";

function Captcha({ onVerify }) {
    return (
        <div style={{ marginTop: "15px", display: "flex", justifyContent: "center" }}>
            <Turnstile
                sitekey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
                onVerify={(token) => onVerify(token)}
                theme="light"
            />
        </div>
    );
}

export default Captcha;
