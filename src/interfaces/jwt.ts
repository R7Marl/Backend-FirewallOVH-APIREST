export interface JWTEnvVars {
  SECRET_KEY: string;
}

export interface DecodedToken {
  user: any;
}
