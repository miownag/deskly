export type DriverType = 'robotjs' | 'cliclick';

export interface ScreenInfo {
  /** Screenshot (backing store) resolution — always 2× logical on Retina Macs */
  captureWidth: number;
  captureHeight: number;
  logicalWidth: number;
  logicalHeight: number;
  scaleFactor: number;
}

export interface ProcessedImage {
  buffer: Buffer;
  base64: string;
  displayWidth: number;
  displayHeight: number;
}

export interface CropBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ZoomResult {
  image: ProcessedImage;
  cropBounds: CropBounds;
}

export interface ServerConfig {
  zoomPadding: number;
}
