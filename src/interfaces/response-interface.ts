export interface ResponseInterface<T> {
  statusCode: number;
  data: T;
  message: string;
}
