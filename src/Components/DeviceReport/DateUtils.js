import jalaali from "jalaali-js";

export function toJalaliDateString(isoDateString) {
  const d = new Date(isoDateString);
  const localDate = new Date(d.getTime() + 0 * 60 * 60 * 1000);

  const { jy, jm, jd } = jalaali.toJalaali(localDate);
  const hh = localDate.getHours().toString().padStart(2, "0");
  const mm = localDate.getMinutes().toString().padStart(2, "0");

  return `${jy}/${jm.toString().padStart(2, "0")}/${jd
    .toString()
    .padStart(2, "0")} ${hh}:${mm}`;
}
