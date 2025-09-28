import DeviceReport from '../DeviceReport/DeviceReport'; 
import { useReportStore } from '../../Store/dateStore';
import "./DeviceReportModal.css";

export default function DeviceReportModal({ isOpen, onClose, deviceId, data, deviceInfos, deviceClass}) {
  const selectedDate = useReportStore((state) => state.selectedDate);

  console.log('deviceInfos', deviceInfos);


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <DeviceReport
          key={`${deviceId}-${selectedDate?.toISOString?.()}`}
          rawData={data}
          deviceId={deviceId}
          deviceClass={deviceClass}
          deviceInfos={deviceInfos}
        />
      </div>
    </div>
  );
}
