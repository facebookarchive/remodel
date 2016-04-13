
declare module 'jsondiffpatch' {
  module jsondiffpatch {
    interface ConsoleFormatter {
      format(input: any): string;
    }

    var console:ConsoleFormatter;

    function diff(left: any, right: any): any;
  }

  export = jsondiffpatch;
}
