export function getColor(i, numItems = 25) {
  const multiplier = 255 / (numItems - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

export const mapIndexToData = (_d, index, arr) => {
  const backgroundColor = getColor(index, arr.length);
  return {
    text: `${index}`,
    key: `key-${index}`,
    backgroundColor,
    height: 75,
  };
};
