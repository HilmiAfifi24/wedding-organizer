export const parseBookingEventDate = (value: string) => {
  const [year, month, day] = value.split("-").map((segment) => Number.parseInt(segment, 10));

  if (!year || !month || !day) {
    return new Date(Number.NaN);
  }

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

export const isPastBookingEventDate = (value: string) => {
  const eventDate = parseBookingEventDate(value);
  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }

  const today = new Date();
  const todayBoundary = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventBoundary = new Date(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate()
  );

  return eventBoundary < todayBoundary;
};

export const getBookingDateInputMin = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatBookingDate = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
