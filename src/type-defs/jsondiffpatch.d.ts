declare module 'jsondiffpatch' {
  namespace jsondiffpatch {
    interface ConsoleFormatter {
      format(input: any): string;
    }

    var console: ConsoleFormatter;

    function diff(left: any, right: any): any;
  }

  export = jsondiffpatch;
}
