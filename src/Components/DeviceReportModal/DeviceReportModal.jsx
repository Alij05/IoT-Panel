import DeviceReport from '../DeviceReport/DeviceReport';
import { useReportStore } from '../../Store/dateStore';
import "./DeviceReportModal.css";

export default function DeviceReportModal({ isOpen, onClose, deviceId, data, deviceInfos, deviceClass }) {
  const selectedDate = useReportStore((state) => state.selectedDate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
