declare module 'ovh' {
  interface OVHConfig {
    endpoint: string | undefined;
    appKey: string | undefined;
    appSecret: string | undefined;
    consumerKey: string | undefined;
  }

  interface OVHClient {
    request(method: string, path: string, body?: any): Promise<any>;
    re: (method: string, path: string, body?: any) => Promise<any>;
    signRequest(httpMethod: string, url: string, body: string, timestamp: number): string;
  }

  function ovh(config: OVHConfig): OVHClient;
  export default ovh;
} 