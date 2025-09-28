import IconRenderer from '../../libs/iot-icons/IconRenderer';
import "./ReportCard.css";

export default function ReportCard({ entityInfo, deviceClass, Name, onClick }) {
  return (
    <div className="report-card-container" onClick={onClick}>
      <IconRenderer
        entityId={deviceClass}
        width={32}
        height={32}
        className="report-card-icon"
      />
      <h1 className="report-card-name">{entityInfo.deviceName} در {entityInfo.deviceLocationName}</h1>
    </div>
  );
}
