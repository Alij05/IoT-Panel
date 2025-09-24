import IconRenderer from "iot-icons";
import "./ReportCard.css";

export default function ReportCard({ Entity, Name, onClick }) {
  return (
    <div className="report-card-container" onClick={onClick}>
      <IconRenderer
        entityId={Entity}
        width={32}
        height={32}
        className="report-card-icon"
      />
      <h1 className="report-card-name">{Name}</h1>
    </div>
  );
}
