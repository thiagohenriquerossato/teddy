export interface IAuthRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}