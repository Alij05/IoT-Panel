import { useEffect, useRef, useState, useCallback } from "react";
import throttle from "lodash.throttle";
import "./RGBColorPicker.css";
import { toast } from "react-toastify";
import { getSocket } from "../../WebSocket/Socket";

let msgId = 1; // To keep request IDs unique

export default function RGBColorPicker({ rgbSensorID }) {
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [isDragging, setIsDragging] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
  }, []);


  // Function to send color to LED (without throttling)
  // useCallback is used to memoize the function and prevent unnecessary re-creations on each render (Address of Function is Constant)
  const sendColorToLED = useCallback((rgb) => {
    try {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        toast.error("WebSocket connection is not open");
        return;
      }

      const payload = {
        id: msgId++,
        type: "call_service",
        domain: "light",
        service: "turn_on",
        target: {
          entity_id: rgbSensorID,
        },
        service_data: {
          rgb_color: rgb,
        },
      };

      socket.send(JSON.stringify(payload));
    } catch (err) {
      toast.error("Error sending color via WebSocket", { className: "toast-center" });
      console.error("Error sending color via WebSocket:", err);
    }
  }, [rgbSensorID]);

  // Throttle the sendColorToLED function to run at most once every 150ms
  const throttledSendColorToLED = useRef(
    throttle((rgb) => {
      sendColorToLED(rgb);
    }, 150)
  ).current;

  useEffect(() => {
    // Cancel throttled calls when sendColorToLED changes (e.g., when rgbSensorID changes)
    throttledSendColorToLED.cancel();
  }, [sendColorToLED, throttledSendColorToLED]);


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
    throttledSendColorToLED([r, g, b]); // Use throttled send function here
  };

  return (
    <div className="wheel-container">
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
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
  );
}

// Convert RGB to HEX string
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
