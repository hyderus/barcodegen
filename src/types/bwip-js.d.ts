declare module 'bwip-js' {
  export interface RenderOptions {
    bcid: string;
    text: string;
    scaleX?: number;
    scaleY?: number;
    scale?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textfont?: string;
    textsize?: number;
    textxalign?: 'offleft' | 'left' | 'center' | 'right' | 'offright' | 'justify';
    textyalign?: 'below' | 'center' | 'above';
    barcolor?: string;
    backgroundcolor?: string;
    rotate?: 'N' | 'R' | 'L' | 'I';
    padding?: number;
    paddingwidth?: number;
    paddingheight?: number;
    [key: string]: any;
  }

  export function toCanvas(canvas: HTMLCanvasElement | string, opts: RenderOptions): HTMLCanvasElement;
  export function toSVG(opts: RenderOptions): string;
  export const symbolList: Array<{ bcid: string; desc: string; text: string; opts: string }>;

  const bwipjs: {
    toCanvas: typeof toCanvas;
    toSVG: typeof toSVG;
    symbolList: typeof symbolList;
    [key: string]: any;
  };

  export default bwipjs;
}
