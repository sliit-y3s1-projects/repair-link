declare module 'express' {
  export interface Request {
    body: unknown;
    headers: Record<string, string | string[] | undefined>;
    method: string;
    originalUrl: string;
    params: Record<string, string>;
    query: Record<string, unknown>;
  }

  export interface Response {
    headersSent: boolean;
    status(code: number): this;
    json(body: unknown): this;
  }

  export type NextFunction = (error?: unknown) => void;
  export type RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => unknown;

  export interface Router {
    use(...handlers: unknown[]): this;
    get(path: string, ...handlers: RequestHandler[]): this;
    post(path: string, ...handlers: RequestHandler[]): this;
    put(path: string, ...handlers: RequestHandler[]): this;
    patch(path: string, ...handlers: RequestHandler[]): this;
    delete(path: string, ...handlers: RequestHandler[]): this;
  }

  export interface Application extends Router {
    disable(setting: string): this;
    listen(port: number, callback?: () => void): { close(callback?: (error?: Error) => void): void };
  }

  interface ExpressFactory {
    (): Application;
    Router(): Router;
    json(options?: { limit?: string }): RequestHandler;
  }

  const express: ExpressFactory;
  export default express;
}

declare module 'cors' {
  import type { RequestHandler } from 'express';

  interface CorsOptions {
    origin?: string | string[] | boolean;
    credentials?: boolean;
  }

  const cors: (options?: CorsOptions) => RequestHandler;
  export default cors;
}
