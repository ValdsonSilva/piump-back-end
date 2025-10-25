import { DateTime } from "luxon";

export const nowNewYork = () => DateTime.now().setZone("America/New_York");

function toISODateNY(s: string): string {
  // tenta ISO primeiro (ex.: 2025-10-06 ou 2025-10-06T13:00:00)
  let dt = DateTime.fromISO(s, { zone: "America/New_York" });
  if (dt.isValid) return dt.toISODate();

  // formatos comuns
  dt = DateTime.fromFormat(s, "dd/MM/yyyy", { zone: "America/New_York" });
  if (dt.isValid) return dt.toISODate();

  dt = DateTime.fromFormat(s, "MM/dd/yyyy", { zone: "America/New_York" });
  if (dt.isValid) return dt.toISODate();

  // última tentativa (parsing do JS)
  dt = DateTime.fromJSDate(new Date(s)).setZone("America/New_York");
  return dt.isValid ? dt.toISODate() : s; // se não der, devolve como veio
}

export function computeAssignedDate(sameDay: boolean, data: string) {
  const now = nowNewYork();
  const cutoff = now.set({ hour: 11, minute: 0, second: 0, millisecond: 0 });

  if (sameDay) {
    // Após 11:00 → dia seguinte; antes (ou exatamente às 11) → hoje
    return (now > cutoff ? now.plus({ days: 1 }) : now).toISODate();
  }

  // Normaliza a data do parâmetro para o mesmo formato (YYYY-MM-DD)
  return toISODateNY(data);
}
