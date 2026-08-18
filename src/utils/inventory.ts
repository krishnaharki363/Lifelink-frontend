export const stockInputValueFromChange = (nextValue: string): string => nextValue;

export const parseStockInput = (value: string): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.trunc(parsed);
};

export const calculateStockPercentage = (stockUnits: number, totalStock: number): number => {
  if (stockUnits <= 0 || totalStock <= 0) {
    return 0;
  }

  return Math.min(Math.round((stockUnits / totalStock) * 100), 100);
};
