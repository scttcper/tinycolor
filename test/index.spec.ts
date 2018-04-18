import { TinyColor } from '../src/index';
import conversions from './conversions';

describe('TinyColor', () => {
  it('should init', () => {
    const r = new TinyColor('red');
    expect(r).toBeTruthy();
  });
  it('should parse options', () => {
    expect(new TinyColor('red', { format: 'hex' }).toString()).toEqual('#ff0000');
    expect(new TinyColor().fromRatio({ r: 1, g: 0, b: 0 }, { format: 'hex' }).toString()).toEqual(
      '#ff0000',
    );
  });
  it('should get original input', () => {
    const colorRgbUp = 'RGB(39, 39, 39)';
    const colorRgbLow = 'rgb(39, 39, 39)';
    const colorRgbMix = 'RgB(39, 39, 39)';
    const tinycolorObj = new TinyColor(colorRgbMix);
    const inputObj = { r: 100, g: 100, b: 100 };
    const r = new TinyColor('red');
    // original lowercase input is returned
    expect(new TinyColor(colorRgbLow).getOriginalInput()).toBe(colorRgbLow);
    //  original uppercase input is returned
    expect(new TinyColor(colorRgbUp).getOriginalInput()).toBe(colorRgbUp);
    // original mixed input is returned
    expect(new TinyColor(colorRgbMix).getOriginalInput()).toBe(colorRgbMix);
    // when given a tinycolor instance, the color string is returned
    expect(new TinyColor(tinycolorObj).getOriginalInput()).toBe(colorRgbMix);
    // when given an object, the object is returned
    expect(new TinyColor(inputObj).getOriginalInput()).toBe(inputObj);
    //  when given an empty string, an empty string is returned
    expect(new TinyColor('').getOriginalInput()).toBe('');
    //  when given a null value, an empty string is returned
    expect(new TinyColor(null).getOriginalInput()).toBe('');
  });
  it('should have color equality', () => {
    expect(conversions.length).toBe(16);
    for (const c of conversions) {
      const tiny = new TinyColor(c.hex);
      expect(tiny.isValid()).toBe(true);
      expect(new TinyColor().equals(c.rgb, c.hex)).toBe(true);
      expect(new TinyColor().equals(c.rgb, c.hex8)).toBe(true);
      expect(new TinyColor().equals(c.rgb, c.hsl)).toBe(true);
      expect(new TinyColor().equals(c.rgb, c.hsv)).toBe(true);
      expect(new TinyColor().equals(c.rgb, c.rgb)).toBe(true);
      expect(new TinyColor().equals(c.hex, c.hex)).toBe(true);
      expect(new TinyColor().equals(c.hex, c.hex8)).toBe(true);
      expect(new TinyColor().equals(c.hex, c.hsl)).toBe(true);
      expect(new TinyColor().equals(c.hex, c.hsv)).toBe(true);
      expect(new TinyColor().equals(c.hsl, c.hsv)).toBe(true);
    }
  });
  it('should parse ratio', () => {
    // with ratio
    // white
    expect(new TinyColor().fromRatio({ r: 1, g: 1, b: 1 }).toHexString()).toBe('#ffffff');
    // alpha works when ratio is parsed
    expect(new TinyColor().fromRatio({ r: 1, g: 0, b: 0, a: 0.5 }).toRgbString()).toBe(
      'rgba(255, 0, 0, 0.5)',
    );
    // alpha = 1 works when ratio is parsed
    expect(new TinyColor().fromRatio({ r: 1, g: 0, b: 0, a: 1 }).toRgbString()).toBe(
      'rgb(255, 0, 0)',
    );
    // alpha > 1 works when ratio is parsed
    expect(new TinyColor().fromRatio({ r: 1, g: 0, b: 0, a: 10 }).toRgbString()).toBe(
      'rgb(255, 0, 0)',
    );
    // alpha < 1 works when ratio is parsed
    expect(new TinyColor().fromRatio({ r: 1, g: 0, b: 0, a: -1 }).toRgbString()).toBe(
      'rgb(255, 0, 0)',
    );

    // without ratio
    expect(new TinyColor({ r: 1, g: 1, b: 1 }).toHexString()).toBe('#010101');
    expect(new TinyColor({ r: 0.1, g: 0.1, b: 0.1 }).toHexString()).toBe('#000000');
    expect(new TinyColor('rgb .1 .1 .1').toHexString()).toBe('#000000');
  });
  it('should parse rgb text', () => {
    // spaced input
    expect(new TinyColor('rgb 255 0 0').toHexString()).toBe('#ff0000');
    // parenthesized input
    expect(new TinyColor('rgb(255, 0, 0)').toHexString()).toBe('#ff0000');
    // parenthesized spaced input
    expect(new TinyColor('rgb (255, 0, 0)').toHexString()).toBe('#ff0000');
    // object input
    expect(new TinyColor({ r: 255, g: 0, b: 0 }).toHexString()).toBe('#ff0000');
    // object input and compare
    expect(new TinyColor({ r: 255, g: 0, b: 0 }).toRgb()).toEqual({ r: 255, g: 0, b: 0, a: 1 });

    expect(new TinyColor().equals({ r: 200, g: 100, b: 0 }, 'rgb(200, 100, 0)')).toBe(true);
    expect(new TinyColor().equals({ r: 200, g: 100, b: 0 }, 'rgb 200 100 0')).toBe(true);
    expect(new TinyColor().equals({ r: 200, g: 100, b: 0 }, 'rgb 200 100 0')).toBe(true);
    expect(new TinyColor().equals({ r: 200, g: 100, b: 0, a: 0.4 }, 'rgba 200 100 0 .4')).toBe(
      true,
    );
    expect(new TinyColor().equals({ r: 199, g: 100, b: 0 })).toBe(false);

    expect(new TinyColor().equals({ r: 199, g: 100, b: 0 })).toBe(false);
    expect(new TinyColor().equals({ r: 199, g: 100, b: 0 })).toBe(false);
    expect(new TinyColor().equals({ r: 199, g: 100, b: 0 })).toBe(false);

    expect(new TinyColor().equals(new TinyColor({ r: 200, g: 100, b: 0 }))).toBe(false);
    expect(new TinyColor().equals(new TinyColor({ r: 200, g: 100, b: 0 }))).toBe(false);
    expect(new TinyColor().equals(new TinyColor({ r: 200, g: 100, b: 0 }))).toBe(false);
  });
  it('should parse percentage rgb text', () => {
    // spaced input
    expect(new TinyColor('rgb 100% 0% 0%').toHexString()).toBe('#ff0000');
    // parenthesized input
    expect(new TinyColor('rgb(100%, 0%, 0%)').toHexString()).toBe('#ff0000');
    // parenthesized spaced input
    expect(new TinyColor('rgb (100%, 0%, 0%)').toHexString()).toBe('#ff0000');
    // object input
    expect(new TinyColor({ r: '100%', g: '0%', b: '0%' }).toHexString()).toBe('#ff0000');
    // object input and compare
    expect(new TinyColor({ r: '100%', g: '0%', b: '0%' }).toRgb()).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    const ty = new TinyColor();
    expect(ty.equals({ r: '90%', g: '45%', b: '0%' }, 'rgb(90%, 45%, 0%)')).toBe(true);
    expect(ty.equals({ r: '90%', g: '45%', b: '0%' }, 'rgb 90% 45% 0%')).toBe(true);
    expect(ty.equals({ r: '90%', g: '45%', b: '0%' }, 'rgb 90% 45% 0%')).toBe(true);
    expect(ty.equals({ r: '90%', g: '45%', b: '0%', a: 0.4 }, 'rgba 90% 45% 0% .4')).toBe(true);
    expect(ty.equals({ r: '89%', g: '45%', b: '0%' }, 'rgba 90% 45% 0% 1')).toBe(false);

    expect(ty.equals({ r: '89%', g: '45%', b: '0%' }, 'rgb(90%, 45%, 0%)')).toBe(false);
    expect(ty.equals({ r: '89%', g: '45%', b: '0%' }, 'rgb 90% 45% 0%')).toBe(false);
    expect(ty.equals({ r: '89%', g: '45%', b: '0%' }, 'rgb 90% 45% 0%')).toBe(false);

    expect(ty.equals(new TinyColor({ r: '90%', g: '45%', b: '0%' }), 'rgb 90% 45% 0%')).toBe(true);
    expect(ty.equals(new TinyColor({ r: '90%', g: '45%', b: '0%' }), 'rgb 90% 45% 0%')).toBe(true);
    expect(ty.equals(new TinyColor({ r: '90%', g: '45%', b: '0%' }), 'rgb(90%, 45%, 0%)')).toBe(
      true,
    );
  });
  it('should parse HSL', () => {
    // to hex
    expect(new TinyColor({ h: 251, s: 100, l: 0.38 }).toHexString()).toBe('#2400c2');
    // to rgb
    expect(new TinyColor({ h: 251, s: 100, l: 0.38 }).toRgbString()).toBe('rgb(36, 0, 194)');
    // to hsl
    expect(new TinyColor({ h: 251, s: 100, l: 0.38 }).toHslString()).toBe('hsl(251, 100%, 38%)');
    // to hex
    expect(new TinyColor('hsl(251, 100, 38)').toHexString()).toBe('#2400c2');
    // to rgb
    expect(new TinyColor('hsl(251, 100%, 38%)').toRgbString()).toBe('rgb(36, 0, 194)');
    // to hsl
    expect(new TinyColor('hsl(251, 100%, 38%)').toHslString()).toBe('hsl(251, 100%, 38%)');
    // problematic hsl
    expect(new TinyColor('hsl 100 20 10').toHslString()).toBe('hsl(100, 20%, 10%)');
  });
  it('should parse Hex', () => {
    expect(new TinyColor('rgb 255 0 0').toHexString()).toBe('#ff0000');
    expect(new TinyColor('rgb 255 0 0').toHexString(true)).toBe('#f00');
    expect(new TinyColor('rgba 255 0 0 0.5').toHex8String()).toBe('#ff000080');
    expect(new TinyColor('rgba 255 0 0 0').toHex8String()).toBe('#ff000000');
    expect(new TinyColor('rgba 255 0 0 1').toHex8String()).toBe('#ff0000ff');
    expect(new TinyColor('rgba 255 0 0 1').toHex8String(true)).toBe('#f00f');
    expect(new TinyColor('rgb 255 0 0').toHex()).toBe('ff0000');
    expect(new TinyColor('rgb 255 0 0').toHex(true)).toBe('f00');
    expect(new TinyColor('rgba 255 0 0 0.5').toHex8()).toBe('ff000080');
  });
  it('HSV Parsing', () => {
    expect(new TinyColor('hsv 251.1 0.887 .918').toHsvString()).toBe('hsv(251, 89%, 92%)');
    expect(new TinyColor('hsv 251.1 0.887 0.918').toHsvString()).toBe('hsv(251, 89%, 92%)');
    expect(new TinyColor('hsva 251.1 0.887 0.918 0.5').toHsvString()).toBe(
      'hsva(251, 89%, 92%, 0.5)',
    );
  });
  it('Invalid Parsing', function() {
    let invalidColor = new TinyColor('this is not a color');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor('#red');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor('  #red');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor('##123456');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor('  ##123456');
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor({ r: 'invalid', g: 'invalid', b: 'invalid' });
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor({ h: 'invalid', s: 'invalid', l: 'invalid' } as any);
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);

    invalidColor = new TinyColor({ h: 'invalid', s: 'invalid', v: 'invalid' } as any);
    expect(invalidColor.toHexString()).toBe('#000000');
    expect(invalidColor.isValid()).toBe(false);
  });
  it('Named colors', function() {
    expect(new TinyColor('aliceblue').toHex()).toBe('f0f8ff');
    expect(new TinyColor('antiquewhite').toHex()).toBe('faebd7');
    expect(new TinyColor('aqua').toHex()).toBe('00ffff');
    expect(new TinyColor('aquamarine').toHex()).toBe('7fffd4');
    expect(new TinyColor('azure').toHex()).toBe('f0ffff');
    expect(new TinyColor('beige').toHex()).toBe('f5f5dc');
    expect(new TinyColor('bisque').toHex()).toBe('ffe4c4');
    expect(new TinyColor('black').toHex()).toBe('000000');
    expect(new TinyColor('blanchedalmond').toHex()).toBe('ffebcd');
    expect(new TinyColor('blue').toHex()).toBe('0000ff');
    expect(new TinyColor('blueviolet').toHex()).toBe('8a2be2');
    expect(new TinyColor('brown').toHex()).toBe('a52a2a');
    expect(new TinyColor('burlywood').toHex()).toBe('deb887');
    expect(new TinyColor('cadetblue').toHex()).toBe('5f9ea0');
    expect(new TinyColor('chartreuse').toHex()).toBe('7fff00');
    expect(new TinyColor('chocolate').toHex()).toBe('d2691e');
    expect(new TinyColor('coral').toHex()).toBe('ff7f50');
    expect(new TinyColor('cornflowerblue').toHex()).toBe('6495ed');
    expect(new TinyColor('cornsilk').toHex()).toBe('fff8dc');
    expect(new TinyColor('crimson').toHex()).toBe('dc143c');
    expect(new TinyColor('cyan').toHex()).toBe('00ffff');
    expect(new TinyColor('darkblue').toHex()).toBe('00008b');
    expect(new TinyColor('darkcyan').toHex()).toBe('008b8b');
    expect(new TinyColor('darkgoldenrod').toHex()).toBe('b8860b');
    expect(new TinyColor('darkgray').toHex()).toBe('a9a9a9');
    expect(new TinyColor('darkgreen').toHex()).toBe('006400');
    expect(new TinyColor('darkkhaki').toHex()).toBe('bdb76b');
    expect(new TinyColor('darkmagenta').toHex()).toBe('8b008b');
    expect(new TinyColor('darkolivegreen').toHex()).toBe('556b2f');
    expect(new TinyColor('darkorange').toHex()).toBe('ff8c00');
    expect(new TinyColor('darkorchid').toHex()).toBe('9932cc');
    expect(new TinyColor('darkred').toHex()).toBe('8b0000');
    expect(new TinyColor('darksalmon').toHex()).toBe('e9967a');
    expect(new TinyColor('darkseagreen').toHex()).toBe('8fbc8f');
    expect(new TinyColor('darkslateblue').toHex()).toBe('483d8b');
    expect(new TinyColor('darkslategray').toHex()).toBe('2f4f4f');
    expect(new TinyColor('darkturquoise').toHex()).toBe('00ced1');
    expect(new TinyColor('darkviolet').toHex()).toBe('9400d3');
    expect(new TinyColor('deeppink').toHex()).toBe('ff1493');
    expect(new TinyColor('deepskyblue').toHex()).toBe('00bfff');
    expect(new TinyColor('dimgray').toHex()).toBe('696969');
    expect(new TinyColor('dodgerblue').toHex()).toBe('1e90ff');
    expect(new TinyColor('firebrick').toHex()).toBe('b22222');
    expect(new TinyColor('floralwhite').toHex()).toBe('fffaf0');
    expect(new TinyColor('forestgreen').toHex()).toBe('228b22');
    expect(new TinyColor('fuchsia').toHex()).toBe('ff00ff');
    expect(new TinyColor('gainsboro').toHex()).toBe('dcdcdc');
    expect(new TinyColor('ghostwhite').toHex()).toBe('f8f8ff');
    expect(new TinyColor('gold').toHex()).toBe('ffd700');
    expect(new TinyColor('goldenrod').toHex()).toBe('daa520');
    expect(new TinyColor('gray').toHex()).toBe('808080');
    expect(new TinyColor('grey').toHex()).toBe('808080');
    expect(new TinyColor('green').toHex()).toBe('008000');
    expect(new TinyColor('greenyellow').toHex()).toBe('adff2f');
    expect(new TinyColor('honeydew').toHex()).toBe('f0fff0');
    expect(new TinyColor('hotpink').toHex()).toBe('ff69b4');
    expect(new TinyColor('indianred ').toHex()).toBe('cd5c5c');
    expect(new TinyColor('indigo ').toHex()).toBe('4b0082');
    expect(new TinyColor('ivory').toHex()).toBe('fffff0');
    expect(new TinyColor('khaki').toHex()).toBe('f0e68c');
    expect(new TinyColor('lavender').toHex()).toBe('e6e6fa');
    expect(new TinyColor('lavenderblush').toHex()).toBe('fff0f5');
    expect(new TinyColor('lawngreen').toHex()).toBe('7cfc00');
    expect(new TinyColor('lemonchiffon').toHex()).toBe('fffacd');
    expect(new TinyColor('lightblue').toHex()).toBe('add8e6');
    expect(new TinyColor('lightcoral').toHex()).toBe('f08080');
    expect(new TinyColor('lightcyan').toHex()).toBe('e0ffff');
    expect(new TinyColor('lightgoldenrodyellow').toHex()).toBe('fafad2');
    expect(new TinyColor('lightgrey').toHex()).toBe('d3d3d3');
    expect(new TinyColor('lightgreen').toHex()).toBe('90ee90');
    expect(new TinyColor('lightpink').toHex()).toBe('ffb6c1');
    expect(new TinyColor('lightsalmon').toHex()).toBe('ffa07a');
    expect(new TinyColor('lightseagreen').toHex()).toBe('20b2aa');
    expect(new TinyColor('lightskyblue').toHex()).toBe('87cefa');
    expect(new TinyColor('lightslategray').toHex()).toBe('778899');
    expect(new TinyColor('lightsteelblue').toHex()).toBe('b0c4de');
    expect(new TinyColor('lightyellow').toHex()).toBe('ffffe0');
    expect(new TinyColor('lime').toHex()).toBe('00ff00');
    expect(new TinyColor('limegreen').toHex()).toBe('32cd32');
    expect(new TinyColor('linen').toHex()).toBe('faf0e6');
    expect(new TinyColor('magenta').toHex()).toBe('ff00ff');
    expect(new TinyColor('maroon').toHex()).toBe('800000');
    expect(new TinyColor('mediumaquamarine').toHex()).toBe('66cdaa');
    expect(new TinyColor('mediumblue').toHex()).toBe('0000cd');
    expect(new TinyColor('mediumorchid').toHex()).toBe('ba55d3');
    expect(new TinyColor('mediumpurple').toHex()).toBe('9370db');
    expect(new TinyColor('mediumseagreen').toHex()).toBe('3cb371');
    expect(new TinyColor('mediumslateblue').toHex()).toBe('7b68ee');
    expect(new TinyColor('mediumspringgreen').toHex()).toBe('00fa9a');
    expect(new TinyColor('mediumturquoise').toHex()).toBe('48d1cc');
    expect(new TinyColor('mediumvioletred').toHex()).toBe('c71585');
    expect(new TinyColor('midnightblue').toHex()).toBe('191970');
    expect(new TinyColor('mintcream').toHex()).toBe('f5fffa');
    expect(new TinyColor('mistyrose').toHex()).toBe('ffe4e1');
    expect(new TinyColor('moccasin').toHex()).toBe('ffe4b5');
    expect(new TinyColor('navajowhite').toHex()).toBe('ffdead');
    expect(new TinyColor('navy').toHex()).toBe('000080');
    expect(new TinyColor('oldlace').toHex()).toBe('fdf5e6');
    expect(new TinyColor('olive').toHex()).toBe('808000');
    expect(new TinyColor('olivedrab').toHex()).toBe('6b8e23');
    expect(new TinyColor('orange').toHex()).toBe('ffa500');
    expect(new TinyColor('orangered').toHex()).toBe('ff4500');
    expect(new TinyColor('orchid').toHex()).toBe('da70d6');
    expect(new TinyColor('palegoldenrod').toHex()).toBe('eee8aa');
    expect(new TinyColor('palegreen').toHex()).toBe('98fb98');
    expect(new TinyColor('paleturquoise').toHex()).toBe('afeeee');
    expect(new TinyColor('palevioletred').toHex()).toBe('db7093');
    expect(new TinyColor('papayawhip').toHex()).toBe('ffefd5');
    expect(new TinyColor('peachpuff').toHex()).toBe('ffdab9');
    expect(new TinyColor('peru').toHex()).toBe('cd853f');
    expect(new TinyColor('pink').toHex()).toBe('ffc0cb');
    expect(new TinyColor('plum').toHex()).toBe('dda0dd');
    expect(new TinyColor('powderblue').toHex()).toBe('b0e0e6');
    expect(new TinyColor('purple').toHex()).toBe('800080');
    expect(new TinyColor('rebeccapurple').toHex()).toBe('663399');
    expect(new TinyColor('red').toHex()).toBe('ff0000');
    expect(new TinyColor('rosybrown').toHex()).toBe('bc8f8f');
    expect(new TinyColor('royalblue').toHex()).toBe('4169e1');
    expect(new TinyColor('saddlebrown').toHex()).toBe('8b4513');
    expect(new TinyColor('salmon').toHex()).toBe('fa8072');
    expect(new TinyColor('sandybrown').toHex()).toBe('f4a460');
    expect(new TinyColor('seagreen').toHex()).toBe('2e8b57');
    expect(new TinyColor('seashell').toHex()).toBe('fff5ee');
    expect(new TinyColor('sienna').toHex()).toBe('a0522d');
    expect(new TinyColor('silver').toHex()).toBe('c0c0c0');
    expect(new TinyColor('skyblue').toHex()).toBe('87ceeb');
    expect(new TinyColor('slateblue').toHex()).toBe('6a5acd');
    expect(new TinyColor('slategray').toHex()).toBe('708090');
    expect(new TinyColor('snow').toHex()).toBe('fffafa');
    expect(new TinyColor('springgreen').toHex()).toBe('00ff7f');
    expect(new TinyColor('steelblue').toHex()).toBe('4682b4');
    expect(new TinyColor('tan').toHex()).toBe('d2b48c');
    expect(new TinyColor('teal').toHex()).toBe('008080');
    expect(new TinyColor('thistle').toHex()).toBe('d8bfd8');
    expect(new TinyColor('tomato').toHex()).toBe('ff6347');
    expect(new TinyColor('turquoise').toHex()).toBe('40e0d0');
    expect(new TinyColor('violet').toHex()).toBe('ee82ee');
    expect(new TinyColor('wheat').toHex()).toBe('f5deb3');
    expect(new TinyColor('white').toHex()).toBe('ffffff');
    expect(new TinyColor('whitesmoke').toHex()).toBe('f5f5f5');
    expect(new TinyColor('yellow').toHex()).toBe('ffff00');
    expect(new TinyColor('yellowgreen').toHex()).toBe('9acd32');

    expect(new TinyColor('#f00').toName()).toBe('red');
    expect(new TinyColor('#fa0a0a').toName()).toBe(false);
  });
  it('Invalid alpha should normalize to 1', function() {
    // Negative value
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: -1 }).toRgbString()).toBe('rgb(255, 20, 10)');
    // Negative 0
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: -0 }).toRgbString()).toBe(
      'rgba(255, 20, 10, 0)',
    );
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 0 }).toRgbString()).toBe(
      'rgba(255, 20, 10, 0)',
    );
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 0.5 }).toRgbString()).toBe(
      'rgba(255, 20, 10, 0.5)',
    );
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 1 }).toRgbString()).toBe('rgb(255, 20, 10)');
    // Greater than 1
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 100 }).toRgbString()).toBe('rgb(255, 20, 10)');
    // Non Numeric
    expect(new TinyColor({ r: 255, g: 20, b: 10, a: 'asdfasd' }).toRgbString()).toBe(
      'rgb(255, 20, 10)',
    );

    expect(new TinyColor('#fff').toRgbString()).toBe('rgb(255, 255, 255)');
    // Greater than 1 in string parsing
    expect(new TinyColor('rgba 255 0 0 100').toRgbString()).toBe('rgb(255, 0, 0)');
  });
});
