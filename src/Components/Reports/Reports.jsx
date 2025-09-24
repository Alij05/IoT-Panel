import { useEffect, useState } from "react";
import "./Reports.css";
import { getEntityHistory } from "../../Services/getentityHistory";
import { useIdentityStore } from "../../Store/identityStore";
import ReportCard from "../ReportCard/ReportCard";
import DeviceReportModal from '../DeviceReportModal/DeviceReportModal';
import { useReportStore } from "../../Store/dateStore";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";

export default function Reports() {
  const { entity_id } = useIdentityStore();

  const dataMap = useReportStore((state) => state.dataMap);
  const setDataMap = useReportStore((state) => state.setDataMap);
  const selectedDate = useReportStore((state) => state.selectedDate);
  const range = useReportStore((state) => state.range);
  const resetDate = useReportStore((state) => state.resetDate);
  const resetRange = useReportStore((state) => state.resetRange);

  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({ entity: null, data: null });

  useEffect(() => {
    async function fetchData() {
      try {
        const useRange = range?.from && range?.to;

        const result = await Promise.all(
          entity_id.map((id) =>
            getEntityHistory(
              id,
              useRange ? { from: range.from, to: range.to } : selectedDate
            )
          )
        );
        console.log(result)

        const newDataMap = {};
        entity_id.forEach((id, index) => {
          newDataMap[id] = result[index];
        });
        setDataMap(newDataMap);
      } catch (err) {
        console.error(ReportLocalization.error, err);
      }
    }

    if (entity_id?.length > 0 && (selectedDate || (range?.from && range?.to))) {
      fetchData();
    }
  }, [entity_id, selectedDate, range]);

  useEffect(() => {
    if (modalData.entity && dataMap[modalData.entity]) {
      setModalData((prev) => ({
        ...prev,
        data: dataMap[modalData.entity],
      }));
    }
  }, [dataMap, modalData.entity]);
  const openModalHandler = (modalInfo) => {
    setModalData({ entity: modalInfo.entity, data: modalInfo.data });
    setOpenModal(true);
  };

  return (
    <div>
      <h1 className='users-title'>لیست گزارشات</h1>
      <div className="Devices-section">
        {entity_id.map((item) => (
          <ReportCard
            Entity={item}
            Name={dataMap[item]?.[0]?.attributes?.friendly_name || item}
            key={item}
            onClick={() =>
              openModalHandler({ entity: item, data: dataMap[item] })
            }
          />
        ))}
      </div>

      {openModal && (
        <DeviceReportModal
          key={`${modalData.entity}-${selectedDate?.toISOString?.()}`}
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            resetDate();
            resetRange();
          }}
          entity={modalData.entity}
          data={modalData.data}
        />
      )}
    </div>
  );
}
