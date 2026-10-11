// Region filling runs off the main thread. No network or external libraries.
type FillRequest = { pixels: ArrayBuffer; width: number; height: number; x: number; y: number; color: [number, number, number] };
export function fillRegion(pixels: Uint8ClampedArray, width: number, height: number, x: number, y: number, color: [number, number, number]) {
  if (x < 0 || y < 0 || x >= width || y >= height || pixels.length !== width * height * 4) return;
  const start = (y * width + x) * 4;
  const target = [pixels[start], pixels[start + 1], pixels[start + 2]];
  if (Math.max(...target) < 90 || target.every((value, index) => value === color[index])) return;
  const queue = new Uint32Array(width * height);
  const visited = new Uint8Array(width * height);
  let read = 0; let write = 1; queue[0] = y * width + x; visited[queue[0]] = 1;
  while (read < write) {
    const position = queue[read++]; const offset = position * 4;
    if (Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]) < 90 || target.some((value, index) => Math.abs(pixels[offset + index] - value) > 42)) continue;
    pixels[offset] = color[0]; pixels[offset + 1] = color[1]; pixels[offset + 2] = color[2]; pixels[offset + 3] = 255;
    const px = position % width; const py = Math.floor(position / width);
    const neighbors = [px > 0 ? position - 1 : -1, px < width - 1 ? position + 1 : -1, py > 0 ? position - width : -1, py < height - 1 ? position + width : -1];
    for (const next of neighbors) if (next >= 0 && !visited[next]) { visited[next] = 1; queue[write++] = next; }
  }
}
const scope = typeof self !== 'undefined' ? self as unknown as { onmessage: ((event: MessageEvent<FillRequest>) => void) | null; postMessage: (data: object, transfer: Transferable[]) => void } : null;
if (scope) scope.onmessage = event => {
  const { pixels, width, height, x, y, color } = event.data;
  fillRegion(new Uint8ClampedArray(pixels), width, height, x, y, color);
  scope.postMessage({ pixels }, [pixels]);
};
