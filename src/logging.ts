/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as List from './list';
import * as Map from './map';
import * as Maybe from './maybe';

export enum LoggingType {
  debug,
  error,
  info,
  performance,
  warn,
}

export interface Logger {
  interestedLoggingTypes: List.List<LoggingType>;
  minimalLevel: number;
  processLog: (loggingType: LoggingType, time: Date, info: string) => void;
}

interface LogInfo {
  level: number;
  loggingType: LoggingType;
  time: Date;
  info: string;
}

export class Context<T> {
  public evaluatedLogInfos: List.List<LogInfo>;
  public unevaluatedLogInfos: List.List<LogInfo>;
  public value: T;

  constructor(
    evaluatedLogInfos: List.List<LogInfo>,
    unevaluatedLogInfos: List.List<LogInfo>,
    value: T,
  ) {
    this.value = value;
    this.evaluatedLogInfos = evaluatedLogInfos;
    this.unevaluatedLogInfos = unevaluatedLogInfos;
  }
}

export function Debug<T>(level: number, info: string, value: T): Context<T> {
  const unevaluatedLogInfos = List.of({
    level: level,
    loggingType: LoggingType.debug,
    time: new Date(),
    info: info,
  });
  return new Context<T>(List.of<LogInfo>(), unevaluatedLogInfos, value);
}

export function Error<T>(level: number, info: string, value: T): Context<T> {
  const unevaluatedLogInfos = List.of({
    level: level,
    loggingType: LoggingType.error,
    time: new Date(),
    info: info,
  });
  return new Context<T>(List.of<LogInfo>(), unevaluatedLogInfos, value);
}

export function Info<T>(level: number, info: string, value: T): Context<T> {
  const unevaluatedLogInfos = List.of({
    level: level,
    loggingType: LoggingType.info,
    time: new Date(),
    info: info,
  });
  return new Context<T>(List.of<LogInfo>(), unevaluatedLogInfos, value);
}

export function Performance<T>(
  level: number,
  info: string,
  value: T,
): Context<T> {
  const unevaluatedLogInfos = List.of({
    level: level,
    loggingType: LoggingType.performance,
    time: new Date(),
    info: info,
  });
  return new Context<T>(List.of<LogInfo>(), unevaluatedLogInfos, value);
}

export function Warn<T>(level: number, info: string, value: T): Context<T> {
  const unevaluatedLogInfos = List.of({
    level: level,
    loggingType: LoggingType.warn,
    time: new Date(),
    info: info,
  });
  return new Context<T>(List.of<LogInfo>(), unevaluatedLogInfos, value);
}

export function getValue<T>(context: Context<T>): T {
  return context.value;
}

export function getEvaluatedLogInfos<T>(
  context: Context<T>,
): List.List<LogInfo> {
  return context.evaluatedLogInfos;
}

function buildInterestedTypeMap(
  soFar: Map.Map<LoggingType, boolean>,
  value: LoggingType,
): Map.Map<LoggingType, boolean> {
  return Map.insert(value, true, soFar);
}

export function evaluate<T>(logger: Logger, context: Context<T>): Context<T> {
  const logInfos: List.List<LogInfo> = context.unevaluatedLogInfos;
  const map: Map.Map<LoggingType, boolean> = List.foldl(
    buildInterestedTypeMap,
    Map.Empty<LoggingType, boolean>(),
    logger.interestedLoggingTypes,
  );
  return List.foldr(
    function(context: Context<T>, logInfo: LogInfo) {
      const maybeValue: boolean | null = Map.get(logInfo.loggingType, map);
      return Maybe.match(
        function(bool: boolean) {
          if (logger.minimalLevel <= logInfo.level) {
            logger.processLog(logInfo.loggingType, logInfo.time, logInfo.info);
          }
          return new Context<T>(
            List.cons(logInfo, context.evaluatedLogInfos),
            context.unevaluatedLogInfos,
            context.value,
          );
        },
        function() {
          return new Context<T>(
            context.evaluatedLogInfos,
            List.cons(logInfo, context.evaluatedLogInfos),
            context.value,
          );
        },
        maybeValue,
      );
    },
    new Context<T>(List.of<LogInfo>(), List.of<LogInfo>(), context.value),
    logInfos,
  );
}

export function map<T, U>(f: (t: T) => U, context: Context<T>): Context<U> {
  return new Context<U>(
    context.evaluatedLogInfos,
    context.unevaluatedLogInfos,
    f(context.value),
  );
}

export function mbind<T, U>(
  f: (t: T) => Context<U>,
  context: Context<T>,
): Context<U> {
  const newContext = f(context.value);
  return new Context<U>(
    List.append(newContext.evaluatedLogInfos, context.evaluatedLogInfos),
    List.append(newContext.unevaluatedLogInfos, context.unevaluatedLogInfos),
    newContext.value,
  );
}

export function munit<T>(value: T): Context<T> {
  return new Context<T>(List.of<LogInfo>(), List.of<LogInfo>(), value);
}
