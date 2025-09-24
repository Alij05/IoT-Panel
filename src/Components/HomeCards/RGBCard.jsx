import { useEffect, useRef, useState, useCallback } from "react";
import throttle from "lodash.throttle";
import "./RGBCard.css";
import { toast } from "react-toastify";

let msgId = 1; // To keep request IDs unique

export default function RGBCard({ rgbSensorID, owner, deviceName, deviceLocation }) {
    const canvasRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState("#ffffff");
    const [isDragging, setIsDragging] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const radius = canvas.width / 2;
        const centerX = radius;
        const centerY = radius;

        const image = ctx.createImageData(canvas.width, canvas.height);
        const data = image.data;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > radius) continue;

                const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
                const r = Math.round(127.5 * (1 + Math.cos((angle * Math.PI) / 180)));
                const g = Math.round(127.5 * (1 + Math.cos(((angle + 120) * Math.PI) / 180)));
                const b = Math.round(127.5 * (1 + Math.cos(((angle + 240) * Math.PI) / 180)));

                const factor = distance / radius;
                const finalR = Math.round(r + (255 - r) * (1 - factor));
                const finalG = Math.round(g + (255 - g) * (1 - factor));
                const finalB = Math.round(b + (255 - b) * (1 - factor));

                const index = (y * canvas.width + x) * 4;
                data[index] = finalR;
                data[index + 1] = finalG;
                data[index + 2] = finalB;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(image, 0, 0);
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleColorChange(e);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleColorChange(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleColorChange = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const imageData = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b] = imageData;

        const center = canvas.width / 2;
        const dx = x - center;
        const dy = y - center;
        if (dx * dx + dy * dy > center * center) return;

        const hex = rgbToHex(r, g, b);
        setSelectedColor(hex);
        // throttledSendColorToLED([r, g, b]); // Use throttled send function here
    };

    return (
        <>
            <div className="wheel-home-container home-box">
                 <div style={{ display: "flex", gap: "15px 20px", fontSize: "18px", color: "black", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    {/* <span>دستگاه: {deviceName}</span> */}
                    <span>مکان : {deviceLocation}</span>
                    |
                    <span>مالک : {owner}</span>
                </div>
                <canvas
                    ref={canvasRef}
                    width={180}
                    height={180}
                    className="color-wheel"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                ></canvas>
                <div className="color-preview" style={{ backgroundColor: selectedColor }}>
                    {selectedColor}
                </div>
            </div>
        </>
    );
}

// Convert RGB to HEX string
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
