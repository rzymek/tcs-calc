// './images/units/Arg/00_4w.5b.5w.png' -> '4w.5b.5w'
export function unitName(path: string) {
  const fileName = path.split('/').pop()!;            // '00_4w.5b.5w.png'
  const withoutPrefix = fileName.replace(/^\d+_/, ''); // '4w.5b.5w.png'
  return withoutPrefix.replace(/\.png$/, '');          // '4w.5b.5w'
}
