import { TFunction } from 'i18next';


export interface AddFirewallRuleBody {
    action: string;
    sequence: number;
    destination: string;
    protocol: string;
    sourceip: string;
    sorceport: string;
  }
  
export interface BulkDeleteFirewallRulesBody {
    ruleIds: string[];
  }

export interface OVHClient {
    request: (method: string, url: string, params?: object, callback?: Function) => void;
    signRequest: (httpMethod: string, url: string, reqBody: string, timestamp: number) => string;
  }


declare global {
  namespace Express {
    interface Request {
      t: TFunction;
    }
  }
}