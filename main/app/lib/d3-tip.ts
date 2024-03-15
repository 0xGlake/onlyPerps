declare module 'd3-tip' {
  export default function d3Tip(): d3Tip.Tip;

  namespace d3Tip {
    interface Tip {
      attr(name: string, value: any): Tip;
      offset(offset: [number, number]): Tip;
      html(func: (d: any) => string): Tip;
      show(d: any, target: any): void;
      hide(d: any, target: any): void;
    }
  }
}