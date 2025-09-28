import { useEffect, useState } from "react";
import "./Reports.css";
import { getEntityHistory } from "../../Services/getentityHistory";
import ReportCard from "../ReportCard/ReportCard";
import DeviceReportModal from '../DeviceReportModal/DeviceReportModal';
import { useReportStore } from "../../Store/dateStore";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import { useAuth } from "../../Contexts/AuthContext";
import axios from "axios";
import { useEntityStore } from "../../Store/entityStore";

const url = process.env.REACT_APP_URL;


export default function Reports() {
  const { entity_id, setEntityId, deviceInfos, setDeviceInfos, devicesClass, setDevicesClass } = useEntityStore();
  const { isUserAdmin } = useAuth()

  const dataMap = useReportStore((state) => state.dataMap);
  const setDataMap = useReportStore((state) => state.setDataMap);
  const selectedDate = useReportStore((state) => state.selectedDate);
  const range = useReportStore((state) => state.range);
  const resetDate = useReportStore((state) => state.resetDate);
  const resetRange = useReportStore((state) => state.resetRange);

  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState({ entity: null, data: null });


  useEffect(() => {
    if (isUserAdmin) {
      getAllEntities()
    } else {
      geUserEntities()
    }
  }, [])

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

  async function getAllEntities() {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${url}/api/devices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        const ids = res.data.map((p) => p.entity_id);
        const devicesClass = Object.assign(
          {},
          ...res.data.map(d => ({
            [d.entity_id]: { deviceClass: d.deviceClass }
          }))
        )

        const deviceInfos = res.data.reduce((acc, d) => {
          acc[d.entity_id] = {
            deviceLocationName: d.deviceLocationName,
            deviceName: d.deviceName,
            user: d.user
          };
          return acc;
        }, {});

        setDeviceInfos(deviceInfos)
        setEntityId(ids)
        setDevicesClass(devicesClass)
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function geUserEntities() {
    const token = localStorage.getItem('token');

    try {
      const res = await axios.get(`${url}/api/devices/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        const ids = res.data.map((p) => p.entity_id);
        const devicesClass = Object.assign(
          {},
          ...res.data.map(d => ({
            [d.entity_id]: { deviceClass: d.deviceClass }
          }))
        )

        const deviceInfos = Object.assign(
          {},
          ...res.data.map(d => ({
            [d.entity_id]: {
              deviceLocationName: d.deviceLocationName,
              deviceName: d.deviceName,
              user: d.user
            }
          }))
        );

        setDeviceInfos(deviceInfos)
        setEntityId(ids)
        setDevicesClass(devicesClass)
      }
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <div>
      <h1 className='users-title'>لیست گزارشات</h1>
      <div className="Devices-section">
        {entity_id.map((id) => (
          <ReportCard
            entity={id}
            entityInfo={deviceInfos[id]}
            deviceClass={devicesClass[id].deviceClass}
            Name={dataMap[id]?.[0]?.attributes?.friendly_name || id}
            key={id}
            onClick={() =>
              openModalHandler({ entity: id, data: dataMap[id] })
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
          deviceInfos={deviceInfos[modalData.entity]}
        />
      )}
    </div>
  );
}
