import { TinyColor } from '../src';
import { fromRandom } from '../src/random';

describe('fromRandom', () => {
  it('should accept count', () => {
    expect(fromRandom({ count: 10 }).length).toBe(10);
  });
  it('should accept hue', () => {
    let colors = fromRandom({ hue: 'purple', count: 3, seed: 11100 }).map(n => n.toHexString());
    expect(colors).toEqual(['#9b22e6', '#9f1ceb', '#a316f0']);
    colors = fromRandom({ hue: 'red', count: 3, seed: 13371337 }).map(n => n.toHexString());
    expect(colors).toEqual(['#e34236', '#e34230', '#e8432a']);
    colors = fromRandom({ hue: 'blue', count: 3, seed: 13371337 }).map(n => n.toHexString());
    expect(colors).toEqual(['#3346d6', '#2e39d9', '#2828de']);
    colors = fromRandom({ hue: 'purple', count: 3, seed: 13371337 }).map(n => n.toHexString());
    expect(colors).toEqual(['#9335db', '#952fde', '#9929e3']);
    colors = fromRandom({ hue: 'orange', count: 3, seed: 13371337 }).map(n => n.toHexString());
    expect(colors).toEqual(['#e8a438', '#ebaa31', '#edac2b']);
    colors = fromRandom({ hue: 'pink', count: 3, seed: 13371337 }).map(n => n.toHexString());
    expect(colors).toEqual(['#f03ab9', '#f032b1', '#f22ca9']);
    colors = fromRandom({ hue: '#E6E6FA', count: 3, seed: 420420 }).map(n => n.toHexString());
    expect(colors).toEqual(['#4141d1', '#3939d4', '#3333d6']);
  });
  it('should accept luminosity', () => {
    let colors = fromRandom({ luminosity: 'bright', count: 3, seed: 11100 }).map(n =>
      n.toHexString(),
    );
    expect(colors).toEqual(['#d916f2', '#f511da', '#f70ca5']);
    colors = fromRandom({ luminosity: 'dark', count: 3, seed: 9999923 }).map(n => n.toHexString());
    expect(colors).toEqual(['#06377a', '#05197d', '#0d0580']);
  });
  it('should accept luminosity', () => {
    let colors = fromRandom({ luminosity: 'bright', count: 3, seed: 11100 }).map(n =>
      n.toHexString(),
    );
    expect(colors).toEqual(['#d916f2', '#f511da', '#f70ca5']);
    colors = fromRandom({ luminosity: 'dark', count: 3, seed: 9999923 }).map(n => n.toHexString());
    expect(colors).toEqual(['#06377a', '#05197d', '#0d0580']);
    colors = fromRandom({ luminosity: 'light', count: 3, seed: 9999923 }).map(n => n.toHexString());
    expect(colors).toEqual(['#91baf2', '#8e9ff5', '#938cf5']);
    colors = fromRandom({ luminosity: 'bright', count: 3, seed: 9999923 }).map(n =>
      n.toHexString(),
    );
    expect(colors).toEqual(['#2568c4', '#223ec9', '#2b1fcf']);
    colors = fromRandom({ luminosity: 'random', count: 3, seed: 9999923 }).map(n =>
      n.toHexString(),
    );
    expect(colors).toEqual(['#3e6396', '#3b4ca1', '#4038ab']);
  });
  it('should accept hue and luminosity', () => {
    let colors = fromRandom({ hue: 'red', luminosity: 'bright', count: 3, seed: 13378008 }).map(n =>
      n.toHexString(),
    );
    expect(colors).toEqual(['#db2a21', '#de2d1d', '#e33119']);
    colors = fromRandom({ hue: 'red', luminosity: 'dark', count: 3, seed: 13378008 }).map(n =>
      n.toHexString(),
    );
    expect(colors).toEqual(['#a60f07', '#a61205', '#a81805']);
  });
  it('should accept alpha', () => {
    const colors = fromRandom({ alpha: 0.4, seed: 13378008 })
    expect(colors[0].a).toBe(0.4);
  });
});
