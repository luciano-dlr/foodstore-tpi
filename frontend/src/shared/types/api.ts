export interface ErrorValidacion {
  type: string;
  loc: (string | number)[];
  msg: string;
}

export interface ErrorApi {
  detail?: string | ErrorValidacion[];
}

export interface Paginado<T> {
  total: number;
  items: T[];
}
