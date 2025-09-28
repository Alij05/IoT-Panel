import React from "react";
import { getIconType } from "./getIconType ";

import {ReactComponent  as TemperatureIcon} from "./icons/temperature.svg";
import {ReactComponent  as HumidityIcon} from "./icons/humidity.svg";
import {ReactComponent  as LightIcon} from "./icons/light.svg";
import {ReactComponent  as FanIcon} from "./icons/fan.svg";
import {ReactComponent  as OutletIcon} from "./icons/outlet.svg";
import {ReactComponent  as LockIcon} from "./icons/lock.svg";
import {ReactComponent  as FlameIcon} from "./icons/flame.svg";
import {ReactComponent  as MotionIcon} from "./icons/motion.svg";
import {ReactComponent  as AirQualityIcon} from "./icons/air-quality.svg";
import {ReactComponent  as RGBIcon} from "./icons/rgb.svg";
import {ReactComponent  as SmokeIcon} from "./icons/smoke.svg";
import {ReactComponent  as WaterIcon} from "./icons/water.svg";
import {ReactComponent  as DefaultIcon} from "./icons/default.svg";

const iconMap = {
  fan: FanIcon,
  outlet: OutletIcon,
  lock: LockIcon,
  flame: FlameIcon,
  motion: MotionIcon,
  air: AirQualityIcon,
  rgb: RGBIcon,
  temperature: TemperatureIcon,
  co2: SmokeIcon,
  humidity: HumidityIcon,
  water: WaterIcon,
  light: LightIcon,
  default: DefaultIcon,
};

export default function IconRenderer({ entityId, ...props }) {
  const type = getIconType(entityId);
  const IconComponent = iconMap[type] || DefaultIcon;

  return <IconComponent {...props} />;
}
