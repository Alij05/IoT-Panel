import DeviceReport from '../DeviceReport/DeviceReport'; 
import { useReportStore } from '../../Store/dateStore';
import "./DeviceReportModal.css";

export default function DeviceReportModal({
  isOpen,
  onClose,
  entity,
  data,
}) {
  const selectedDate = useReportStore((state) => state.selectedDate);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <DeviceReport
          key={`${entity}-${selectedDate?.toISOString?.()}`}
          rawData={data}
          Entity={entity}
        />
      </div>
    </div>
  );
}
