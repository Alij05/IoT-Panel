// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";
// import { getCameraHlsUrl, getCameraStreamUrl, checkCameraAvailability } from "../../API/HomeAssistantConnection";

// export default function CameraStream({ cameraId }) {
//     const videoRef = useRef(null);
//     const hlsRef = useRef(null);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [streamUrl, setStreamUrl] = useState(null);
//     const [debugInfo, setDebugInfo] = useState([]);
//     const [videoState, setVideoState] = useState('loading');

//     // Debug logger function  
//     const addDebugLog = (message, data = null) => {
//         const timestamp = new Date().toLocaleTimeString();
//         const logEntry = `[${timestamp}] ${message}`;
//         console.log(logEntry, data || '');
//         setDebugInfo(prev => [...prev, { time: timestamp, message, data }]);
//     };

//     useEffect(() => {
//         let isMounted = true;
        
//         const loadStream = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 setDebugInfo([]);
//                 addDebugLog("شروع بارگذاری stream");
                
//                 // Check camera availability
//                 addDebugLog("بررسی دسترسی دوربین...");
//                 const isAvailable = await checkCameraAvailability(cameraId);
//                 addDebugLog("وضعیت دوربین:", isAvailable ? "در دسترس" : "غیر قابل دسترس");
                
//                 if (!isMounted) return;
                
//                 if (!isAvailable) {
//                     throw new Error("دوربین در دسترس نیست");
//                 }
                
//                 // Try to get stream URL
//                 addDebugLog("درخواست URL جریان ویدیو...");
//                 let hlsUrl;
//                 try {
//                     hlsUrl = await getCameraHlsUrl(cameraId);
//                     addDebugLog("دریافت HLS URL:", hlsUrl);
//                 } catch (hlsError) {
//                     addDebugLog("خطا در HLS، تلاش برای جریان مستقیم...", hlsError.message);
//                     try {
//                         hlsUrl = await getCameraStreamUrl(cameraId);
//                         addDebugLog("دریافت Direct Stream URL:", hlsUrl);
//                     } catch (directError) {
//                         addDebugLog("هر دو روش با شکست مواجه شد", directError.message);
//                         throw new Error("نمی‌توان به جریان ویدیو دسترسی پیدا کرد");
//                     }
//                 }
                
//                 if (!isMounted) return;
//                 setStreamUrl(hlsUrl);
                
//                 // Test if URL is accessible
//                 addDebugLog("تست دسترسی به URL...");
//                 try {
//                     const testResponse = await fetch(hlsUrl, { method: 'HEAD' });
//                     addDebugLog("پاسخ تست URL:", `${testResponse.status} ${testResponse.statusText}`);
//                 } catch (testError) {
//                     addDebugLog("خطا در تست URL:", testError.message);
//                 }
                
//                 // Setup video player
//                 if (videoRef.current) {
//                     addDebugLog("تنظیم پخش‌کننده ویدیو...");
                    
//                     // Clean up previous instance
//                     if (hlsRef.current) {
//                         hlsRef.current.destroy();
//                         addDebugLog("پاک‌سازی نمونه قبلی HLS");
//                     }
                    
//                     const video = videoRef.current;
                    
//                     // Add video event listeners for debugging
//                     video.addEventListener('loadstart', () => {
//                         addDebugLog("رویداد ویدیو: loadstart");
//                         setVideoState('loadstart');
//                     });
                    
//                     video.addEventListener('loadedmetadata', () => {
//                         addDebugLog("رویداد ویدیو: loadedmetadata");
//                         setVideoState('loadedmetadata');
//                     });
                    
//                     video.addEventListener('loadeddata', () => {
//                         addDebugLog("رویداد ویدیو: loadeddata");
//                         setVideoState('loadeddata');
//                     });
                    
//                     video.addEventListener('canplay', () => {
//                         addDebugLog("رویداد ویدیو: canplay");
//                         setVideoState('canplay');
//                     });
                    
//                     video.addEventListener('playing', () => {
//                         addDebugLog("رویداد ویدیو: playing");
//                         setVideoState('playing');
//                     });
                    
//                     video.addEventListener('error', (e) => {
//                         addDebugLog("خطای ویدیو:", `Code: ${e.target.error?.code}, Message: ${e.target.error?.message}`);
//                         setVideoState('error');
//                     });
                    
//                     video.addEventListener('stalled', () => {
//                         addDebugLog("رویداد ویدیو: stalled");
//                         setVideoState('stalled');
//                     });
                    
//                     video.addEventListener('waiting', () => {
//                         addDebugLog("رویداد ویدیو: waiting");
//                         setVideoState('waiting');
//                     });
                    
//                     // Try different approaches
//                     if (Hls.isSupported()) {
//                         addDebugLog("استفاده از HLS.js");
//                         hlsRef.current = new Hls({
//                             debug: true,
//                             enableWorker: false,
//                             lowLatencyMode: true,
//                             backBufferLength: 90
//                         });
                        
//                         hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
//                             addDebugLog("HLS: رسانه متصل شد");
//                         });
                        
//                         hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
//                             addDebugLog("HLS: manifest تجزیه شد", `Levels: ${data.levels.length}`);
//                             video.play().catch(e => addDebugLog("خطا در شروع پخش:", e.message));
//                         });
                        
//                         hlsRef.current.on(Hls.Events.FRAG_LOADED, () => {
//                             addDebugLog("HLS: قطعه بارگذاری شد");
//                         });
                        
//                         hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
//                             addDebugLog("خطای HLS:", `${data.type} - ${data.details}`);
//                             if (data.fatal) {
//                                 setError(`خطای HLS: ${data.details}`);
//                             }
//                         });
                        
//                         hlsRef.current.loadSource(hlsUrl);
//                         hlsRef.current.attachMedia(video);
                        
//                     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//                         addDebugLog("استفاده از HLS بومی");
//                         video.src = hlsUrl;
//                         video.play().catch(e => addDebugLog("خطا در شروع پخش:", e.message));
                        
//                     } else {
//                         addDebugLog("استفاده از جریان مستقیم");
//                         video.src = hlsUrl;
//                         video.play().catch(e => addDebugLog("خطا در شروع پخش:", e.message));
//                     }
                    
//                     // Force play after a delay
//                     setTimeout(() => {
//                         if (videoRef.current && videoRef.current.paused) {
//                             addDebugLog("تلاش برای پخش اجباری...");
//                             videoRef.current.play().catch(e => addDebugLog("خطا در پخش اجباری:", e.message));
//                         }
//                     }, 2000);
//                 }
                
//             } catch (err) {
//                 addDebugLog("خطای کلی:", err.message);
//                 if (isMounted) {
//                     setError(err.message);
//                 }
//             } finally {
//                 if (isMounted) {
//                     setLoading(false);
//                 }
//             }
//         };

//         loadStream();

//         return () => {
//             isMounted = false;
//             if (hlsRef.current) {
//                 hlsRef.current.destroy();
//             }
//         };
//     }, [cameraId]);

//     const handleManualPlay = () => {
//         if (videoRef.current) {
//             addDebugLog("پخش دستی توسط کاربر");
//             videoRef.current.play().catch(e => addDebugLog("خطا در پخش دستی:", e.message));
//         }
//     };

//     const handleDirectUrlTest = () => {
//         if (streamUrl) {
//             addDebugLog("باز کردن URL در تب جدید");
//             window.open(streamUrl, '_blank');
//         }
//     };

//     return (
//         <div style={{ textAlign: 'center', padding: '20px' }}>
//             <h2>پخش زنده دوربین - حالت Debug</h2>
            
//             <div style={{ marginBottom: '20px' }}>
//                 <p>وضعیت ویدیو: <strong>{videoState}</strong></p>
//                 <p>URL جریان: {streamUrl ? "دریافت شده" : "در انتظار..."}</p>
//             </div>
            
//             {loading && (
//                 <div>
//                     <div className="dot-spinner">
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                         <div className="dot-spinner__dot"></div>
//                     </div>
//                     <p>در حال اتصال...</p>
//                 </div>
//             )}
            
//             {error && (
//                 <div style={{ 
//                     color: "red", 
//                     backgroundColor: "#ffe6e6", 
//                     padding: "10px", 
//                     borderRadius: "5px", 
//                     margin: "10px 0" 
//                 }}>
//                     <p>{error}</p>
//                 </div>
//             )}
            
//             <div style={{ margin: '20px 0' }}>
//                 <button onClick={handleManualPlay} style={{ margin: '0 10px', padding: '10px 20px' }}>
//                     پخش دستی
//                 </button>
//                 <button onClick={handleDirectUrlTest} style={{ margin: '0 10px', padding: '10px 20px' }}>
//                     تست URL مستقیم
//                 </button>
//             </div>
            
//             <video
//                 ref={videoRef}
//                 controls
//                 autoPlay
//                 muted
//                 playsInline
//                 style={{ 
//                     width: "100%", 
//                     maxWidth: 640, 
//                     height: 360,
//                     borderRadius: 8, 
//                     boxShadow: "0 0 10px rgba(0,0,0,0.3)",
//                     backgroundColor: "#000",
//                     border: videoState === 'error' ? '2px solid red' : '1px solid #ccc'
//                 }}
//             />
            
//             {/* Debug Information Panel */}
//             <details style={{ marginTop: '20px', textAlign: 'left' }}>
//                 <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>اطلاعات Debug</summary>
//                 <div style={{ 
//                     maxHeight: '300px', 
//                     overflow: 'auto', 
//                     backgroundColor: '#f5f5f5', 
//                     padding: '10px', 
//                     fontFamily: 'monospace',
//                     fontSize: '12px',
//                     direction: 'ltr'
//                 }}>
//                     {debugInfo.map((log, index) => (
//                         <div key={index} style={{ marginBottom: '2px' }}>
//                             <span style={{ color: '#666' }}>{log.time}</span>: {log.message}
//                             {log.data && <span style={{ color: '#007bff' }}> - {JSON.stringify(log.data)}</span>}
//                         </div>
//                     ))}
//                 </div>
//             </details>
            
//             {streamUrl && (
//                 <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
//                     <details>
//                         <summary>جزئیات فنی</summary>
//                         <div style={{ textAlign: 'left', fontFamily: 'monospace', wordBreak: 'break-all' }}>
//                             <p><strong>Camera ID:</strong> {cameraId}</p>
//                             <p><strong>Stream URL:</strong> {streamUrl}</p>
//                             <p><strong>HLS Support:</strong> {Hls.isSupported() ? 'Yes' : 'No'}</p>
//                             <p><strong>Video Element:</strong> {videoRef.current ? 'Ready' : 'Not Ready'}</p>
//                         </div>
//                     </details>
//                 </div>
//             )}
//         </div>
//     );
// }