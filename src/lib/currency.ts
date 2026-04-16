export const formatKes = (value: number | string | null | undefined): string => {
  const num = Number(value ?? 0);
  return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
