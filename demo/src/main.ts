import tinycolor from '../../src/umd_api.js';

// make tinycolor available in the console
(window as any).tinycolor = tinycolor;
(window as any).TinyColor = tinycolor.TinyColor;
console.log('try "new TinyColor(\'blue\')" or "tinycolor.random()"');

const input = document.querySelector<HTMLInputElement>('#color');

input.addEventListener('keyup', event => colorChange((event.target as HTMLInputElement).value));

const codeOutputEl = document.querySelector<HTMLElement>('#code-output');
const filtersEl = document.querySelector<HTMLElement>('#filter-output');
const mostReadableEl = document.querySelector<HTMLElement>('#mostReadable');
const colorBoxEl = document.querySelector<HTMLElement>('#colorBox');

function colorChange(color) {
  const tiny = new tinycolor.TinyColor(color);

  const output = [
    'hex:\t' + tiny.toHexString(),
    'hex8:\t' + tiny.toHex8String(),
    'rgb:\t' + tiny.toRgbString(),
    'hsl:\t' + tiny.toHslString(),
    'hsv:\t' + tiny.toHsvString(),
    'cmyk:\t' + tiny.toCmykString(),
    'name:\t' + (tiny.toName() || 'none'),
    'format:\t' + tiny.format,
    'string:\t' + tiny.toString(),
  ].join('\n');

  codeOutputEl.textContent = output;
  codeOutputEl.style['border-color'] = tiny.toHexString();

  filtersEl.classList.toggle('invisible', !tiny.isValid);

  const lighten = new tinycolor.TinyColor(color).lighten(20).toHexString();
  filtersEl.querySelector<HTMLElement>('.lighten').style['background-color'] = lighten;
  const darken = new tinycolor.TinyColor(color).darken(20).toHexString();
  filtersEl.querySelector<HTMLElement>('.darken').style['background-color'] = darken;
  const saturate = new tinycolor.TinyColor(color).darken(20).toHexString();
  filtersEl.querySelector<HTMLElement>('.saturate').style['background-color'] = saturate;
  const desaturate = new tinycolor.TinyColor(color).desaturate(20).toHexString();
  filtersEl.querySelector<HTMLElement>('.desaturate').style['background-color'] = desaturate;
  const greyscale = new tinycolor.TinyColor(color).greyscale().toHexString();
  filtersEl.querySelector<HTMLElement>('.greyscale').style['background-color'] = greyscale;
  const brighten = new tinycolor.TinyColor(color).brighten(20).toHexString();
  filtersEl.querySelector<HTMLElement>('.brighten').style['background-color'] = brighten;

  const allColors = Object.keys(tinycolor.names);

  const readable = tinycolor.mostReadable(color, allColors);
  mostReadableEl.style['background-color'] = readable.toHexString();

  const colorArrayToHTML = arr =>
    arr.map(e => `<div class="sample" style="background:${e.toHexString()}"></div>`).join('');

  filtersEl.querySelector('.triad').innerHTML = colorArrayToHTML(tiny.triad());
  filtersEl.querySelector('.tetrad').innerHTML = colorArrayToHTML(tiny.tetrad());
  filtersEl.querySelector('.mono').innerHTML = colorArrayToHTML(tiny.monochromatic());
  filtersEl.querySelector('.analogous').innerHTML = colorArrayToHTML(tiny.analogous());
  filtersEl.querySelector('.sc').innerHTML = colorArrayToHTML(tiny.splitcomplement());
}

(window as any).handleChange = function (color) {
  input.value = color;
  colorChange(color);
};

const starterColor = tinycolor.random({ luminosity: 'bright' }).toHexString();
colorChange(starterColor);

// Set that box next to the title to a random color
colorBoxEl.style['background-color'] = starterColor;
