import { MinerApiType } from "wemine-apis";

export type MinerInfo = {
  API: MinerApiType;
  ipAddress: string;
  friendlyMinerId: string;
};

export type MinerOperationalInfo = {
  poolUser: string;
  hashrate: number;
  isOnline: boolean;
};

export type MinerDetails = {
  friendlyPoolId: string | undefined;
  hashrate: number | undefined;
  isOnline: boolean;
  totalEnergyConsumption: number | undefined;
};
