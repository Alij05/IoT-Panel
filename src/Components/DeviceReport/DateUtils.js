import jalaali from "jalaali-js";

export const toJalaliDateString = (isoDateString) => {
  if (!isoDateString) return "-";
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return "-";

  const { jy, jm, jd } = jalaali.toJalaali(date);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  const jalaliString = `${jy}/${String(jm).padStart(2, "0")}/${String(
    jd
  ).padStart(2, "0")}  -  ${hour}:${minute}:${second}`;

  // تبدیل اعداد به فارسی
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return jalaliString.replace(/\d/g, (d) => persianDigits[d]);
};
