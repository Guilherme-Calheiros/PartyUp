const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatter.format(date);
}

export function formatShortDate(value: string) {
  return formatDate(value, shortDateFormatter);
}

export function formatLongDate(value: string) {
  return formatDate(value, longDateFormatter);
}
