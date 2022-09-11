export interface ResponseInterface<T> {
  status: boolean;
  data: T;
  message: string;
}
