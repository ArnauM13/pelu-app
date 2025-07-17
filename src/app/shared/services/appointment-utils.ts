export function isFutureAppointment(appointment: { data: string, hora: string }): boolean {
  if (!appointment?.data || !appointment?.hora) return false;
  const now = new Date();
  const citaDate = new Date(`${appointment.data}T${appointment.hora}:00`);
  return citaDate > now;
}
