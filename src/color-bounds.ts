/**
 * @hidden
 */
export interface ColorBound {
  name: string;
  hueRange: [number, number] | null;
  lowerBounds: [number, number][];
}

/**
 * @hidden
 */
export const bounds: ColorBound[] = [
  {
    name: 'monochrome',
    hueRange: null,
    lowerBounds: [[0, 0], [100, 0]],
  },
  {
    name: 'red',
    hueRange: [-26, 18],
    lowerBounds: [
      [20, 100],
      [30, 92],
      [40, 89],
      [50, 85],
      [60, 78],
      [70, 70],
      [80, 60],
      [90, 55],
      [100, 50],
    ],
  },
  {
    name: 'orange',
    hueRange: [19, 46],
    lowerBounds: [[20, 100], [30, 93], [40, 88], [50, 86], [60, 85], [70, 70], [100, 70]],
  },
  {
    name: 'yellow',
    hueRange: [47, 62],
    lowerBounds: [[25, 100], [40, 94], [50, 89], [60, 86], [70, 84], [80, 82], [90, 80], [100, 75]],
  },
  {
    name: 'green',
    hueRange: [63, 178],
    lowerBounds: [[30, 100], [40, 90], [50, 85], [60, 81], [70, 74], [80, 64], [90, 50], [100, 40]],
  },
  {
    name: 'blue',
    hueRange: [179, 257],
    lowerBounds: [
      [20, 100],
      [30, 86],
      [40, 80],
      [50, 74],
      [60, 60],
      [70, 52],
      [80, 44],
      [90, 39],
      [100, 35],
    ],
  },
  {
    name: 'purple',
    hueRange: [258, 282],
    lowerBounds: [
      [20, 100],
      [30, 87],
      [40, 79],
      [50, 70],
      [60, 65],
      [70, 59],
      [80, 52],
      [90, 45],
      [100, 42],
    ],
  },
  {
    name: 'pink',
    hueRange: [283, 334],
    lowerBounds: [[20, 100], [30, 90], [40, 86], [60, 84], [80, 80], [90, 75], [100, 73]],
  },
];
