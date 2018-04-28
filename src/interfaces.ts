export interface RGB {
  r: number | string;
  g: number | string;
  b: number | string;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number | string;
  s: number | string;
  l: number | string;
}

export interface HSLA extends HSL {
  a: number;
}

export interface HSV {
  h: number | string;
  s: number | string;
  v: number | string;
}

export interface HSVA extends HSV {
  a: number;
}

export interface WCAG2Parms {
  level?: 'AA' | 'AAA';
  size?: 'large' | 'small';
}
