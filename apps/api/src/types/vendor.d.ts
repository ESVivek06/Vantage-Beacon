// Minimal type declarations for packages whose @types stubs aren't hoisting correctly.

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    algorithm?: string;
    issuer?: string;
    audience?: string | string[];
    subject?: string;
    jwtid?: string;
    noTimestamp?: boolean;
    header?: object;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | string[];
    issuer?: string | string[];
    subject?: string;
    clockTolerance?: number;
    complete?: boolean;
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
  }

  export interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
  }

  export type Secret = string | Buffer;

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: Secret,
    options?: SignOptions,
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: Secret,
    options?: VerifyOptions,
  ): JwtPayload | string;

  export function decode(
    token: string,
    options?: { complete?: boolean; json?: boolean },
  ): JwtPayload | string | null;
}

declare module 'cors' {
  import { RequestHandler } from 'express';

  export interface CorsOptions {
    origin?: boolean | string | string[] | RegExp | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  export interface CorsRequest {
    method?: string;
    headers: {
      [key: string]: string | string[] | undefined;
      origin?: string;
      'access-control-request-headers'?: string;
    };
  }

  function cors<T extends CorsRequest = CorsRequest>(options?: CorsOptions): RequestHandler;
  namespace cors {}
  export = cors;
}

declare module 'ws' {
  import { EventEmitter } from 'events';
  import { IncomingMessage, Server as HttpServer } from 'http';
  import { Duplex } from 'stream';

  export interface ServerOptions {
    host?: string;
    port?: number;
    backlog?: number;
    server?: HttpServer;
    verifyClient?: unknown;
    handleProtocols?: unknown;
    path?: string;
    noServer?: boolean;
    clientTracking?: boolean;
    perMessageDeflate?: boolean | object;
    maxPayload?: number;
    skipUTF8Validation?: boolean;
  }

  export class WebSocket extends EventEmitter {
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
    readyState: number;
    protocol: string;
    url: string;
    send(data: unknown, callback?: (err?: Error) => void): void;
    close(code?: number, reason?: string | Buffer): void;
    ping(data?: unknown, mask?: boolean, cb?: (err: Error) => void): void;
    pong(data?: unknown, mask?: boolean, cb?: (err: Error) => void): void;
    on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'message', listener: (data: unknown, isBinary: boolean) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;
  }

  export class WebSocketServer extends EventEmitter {
    options: ServerOptions;
    clients: Set<WebSocket>;
    constructor(options: ServerOptions, callback?: () => void);
    close(cb?: (err?: Error) => void): void;
    handleUpgrade(
      request: IncomingMessage,
      socket: Duplex,
      upgradeHead: Buffer,
      callback: (client: WebSocket, request: IncomingMessage) => void,
    ): void;
    on(event: 'close', listener: () => void): this;
    on(event: 'connection', listener: (socket: WebSocket, request: IncomingMessage) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;
  }

  export { WebSocket as default };
}
