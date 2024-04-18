export const getProp = (
  object: any,
  keys: string | string[],
  defaultVal?: any
): any => {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  let result = object[keys[0]];

  if (result && keys.length > 1) {
    return getProp(result, keys.slice(1));
  }

  return result === undefined ? defaultVal : result;
};

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getValueFromPercent<T>(
  percent: number,
  valueTrue: T,
  valueFalse: T
): T {
  const trueArray: T[] = Array(percent).fill(valueTrue);
  const falseArray: T[] = Array(100 - percent).fill(valueFalse);
  const array: T[] = [...trueArray, ...falseArray]
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

  return randomInArray(array);
}

export function randomInArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getSum(
  condition: "up" | "down",
  value1: number,
  value2: number
): number {
  const operators: { [key: string]: (a: number, b: number) => number } = {
    up: (a, b) => a + b,
    down: (a, b) => a - b,
  };

  return operators[condition](value1, value2);
}
