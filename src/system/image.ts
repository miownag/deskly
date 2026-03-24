import type {
  CropBounds,
  ProcessedImage,
  ScreenInfo,
  ServerConfig,
  ZoomResult,
} from '../types.js';

interface GridLabelRange {
  /** Full-screen relative coordinate of the left/top edge of the crop (0-1) */
  startRel: number;
  /** Full-screen relative coordinate of the right/bottom edge of the crop (0-1) */
  endRel: number;
}

function generateGridSvg(
  width: number,
  height: number,
  cols = 10,
  rows = 10,
  xRange?: GridLabelRange,
  yRange?: GridLabelRange,
): Buffer {
  const cellW = width / cols;
  const cellH = height / rows;
  const lines: string[] = [];
  const isZoom = !!(xRange || yRange);
  const fontSize = isZoom ? 10 : 16;
  const fontWeight = isZoom ? 'normal' : 'bold';

  for (let i = 1; i < cols; i++) {
    const x = Math.round(cellW * i);
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(220,30,30,0.35)" stroke-width="1"/>`,
    );
  }
  for (let i = 1; i < rows; i++) {
    const y = Math.round(cellH * i);
    lines.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(220,30,30,0.35)" stroke-width="1"/>`,
    );
  }

  // Column labels at the top of each column
  for (let i = 0; i < cols; i++) {
    const x = Math.round(cellW * i + cellW / 2);
    const label = xRange
      ? (
          xRange.startRel +
          ((i + 0.5) / cols) * (xRange.endRel - xRange.startRel)
        ).toFixed(2)
      : String(i);
    lines.push(
      `<text x="${x}" y="${isZoom ? 12 : 18}" text-anchor="middle" font-family="monospace" font-size="${fontSize}" font-weight="${fontWeight}" fill="rgba(220,30,30,0.65)">${label}</text>`,
    );
  }

  // Row labels on the left of each row
  for (let i = 0; i < rows; i++) {
    const y = Math.round(cellH * i + cellH / 2 + 4);
    const label = yRange
      ? (
          yRange.startRel +
          ((i + 0.5) / rows) * (yRange.endRel - yRange.startRel)
        ).toFixed(2)
      : String(i);
    lines.push(
      `<text x="${isZoom ? 16 : 8}" y="${y}" text-anchor="middle" font-family="monospace" font-size="${fontSize}" font-weight="${fontWeight}" fill="rgba(220,30,30,0.65)">${label}</text>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${lines.join('')}</svg>`;
  return Buffer.from(svg);
}

export async function processScreenshot(
  buffer: Buffer,
  screenInfo: ScreenInfo,
  _config: ServerConfig,
): Promise<ProcessedImage> {
  const sharp = (await import('sharp')).default;

  // Resize to logical resolution
  let img = sharp(buffer).resize(
    screenInfo.logicalWidth,
    screenInfo.logicalHeight,
  );

  const w = screenInfo.logicalWidth;
  const h = screenInfo.logicalHeight;

  // Overlay grid
  const gridSvg = generateGridSvg(w, h);
  img = sharp(await img.toBuffer()).composite([
    { input: gridSvg, top: 0, left: 0 },
  ]);

  const outBuf = await img.png().toBuffer();

  return {
    buffer: outBuf,
    base64: outBuf.toString('base64'),
    displayWidth: w,
    displayHeight: h,
  };
}

export async function cropAndEnlarge(
  buffer: Buffer,
  screenInfo: ScreenInfo,
  config: ServerConfig,
  relX: number,
  relY: number,
): Promise<ZoomResult> {
  const sharp = (await import('sharp')).default;
  const padding = config.zoomPadding;

  // First resize to logical resolution
  const logBuf = await sharp(buffer)
    .resize(screenInfo.logicalWidth, screenInfo.logicalHeight)
    .toBuffer();

  const logW = screenInfo.logicalWidth;
  const logH = screenInfo.logicalHeight;

  // Calculate crop region centered on (relX, relY)
  const centerX = Math.round(relX * logW);
  const centerY = Math.round(relY * logH);

  const left = Math.max(0, centerX - padding);
  const top = Math.max(0, centerY - padding);
  let cropW = padding * 2;
  let cropH = padding * 2;

  // Clamp to image bounds
  if (left + cropW > logW) cropW = logW - left;
  if (top + cropH > logH) cropH = logH - top;

  const cropBounds: CropBounds = {
    left,
    top,
    width: cropW,
    height: cropH,
  };

  // Extract crop region (no resize/enlarge)
  let img = sharp(logBuf).extract({
    left,
    top,
    width: cropW,
    height: cropH,
  });
  const outW = cropW;
  const outH = cropH;

  // Overlay grid with absolute screen coordinate labels
  const xRange: GridLabelRange = {
    startRel: left / logW,
    endRel: (left + cropW) / logW,
  };
  const yRange: GridLabelRange = {
    startRel: top / logH,
    endRel: (top + cropH) / logH,
  };
  const gridSvg = generateGridSvg(outW, outH, 10, 10, xRange, yRange);
  img = sharp(await img.toBuffer()).composite([
    { input: gridSvg, top: 0, left: 0 },
  ]);

  const outBuf = await img.png().toBuffer();

  return {
    image: {
      buffer: outBuf,
      base64: outBuf.toString('base64'),
      displayWidth: outW,
      displayHeight: outH,
    },
    cropBounds,
  };
}
