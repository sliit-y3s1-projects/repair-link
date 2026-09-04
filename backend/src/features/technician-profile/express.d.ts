declare module 'express' {
  export interface Request {
    body: any;
    params: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
  }

  export interface Response {
    status(code: number): this;
    json(body: any): this;
  }

  export interface Router {
    [key: string]: any;
  }

  const express: {
    Router: () => Router;
  };

  export default express;
}
