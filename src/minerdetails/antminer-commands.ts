import AxiosDigestAuth from "@mhoc/axios-digest-auth";
import { MinerOperationalInfo } from "./common-types";

const ANTMINER_DEFAULTS = {
  MINER_USERNAME: "root",
  MINER_PWD: "root",
};
const ANTMINER_DIGESTAUTH = new AxiosDigestAuth({
  username: ANTMINER_DEFAULTS.MINER_USERNAME,
  password: ANTMINER_DEFAULTS.MINER_PWD,
});

export async function getAntminerInfo(
  minerIpAddress: string
): Promise<MinerOperationalInfo> {
  const val = {
    poolUser: await getAntminerActivePoolUser(minerIpAddress)(),
    hashrate: await getAntminerHashrate(minerIpAddress)(),
    isOnline: await isAntminerOnline(minerIpAddress),
  };
  console.log("getAntminerInfo");
  console.log(val);
  return val;
}

function getAntminerHashrate(minerIpAddress: string): () => Promise<number> {
  return async () => {
    return await ANTMINER_DIGESTAUTH.request({
      headers: { Accept: "application/json" },
      method: "GET",
      url: `http://${minerIpAddress}/cgi-bin/stats.cgi`,
    }).then((res: any) => {
      const minerStats = res.data["STATS"][0];
      return parseFloat(minerStats["rate_30m"]);
    });
  };
}

function getAntminerActivePoolUser(
  minerIpAddress: string
): () => Promise<string> {
  return async () => {
    return await ANTMINER_DIGESTAUTH.request({
      headers: { Accept: "application/json" },
      method: "GET",
      url: `http://${minerIpAddress}/cgi-bin/pools.cgi`,
    }).then((res: any) => {
      const currentPoolInfo = res.data["POOLS"][0];
      return currentPoolInfo.user;
    });
  };
}

export async function isAntminerOnline(minerIpAddress: string): Promise<any> {
  return await ANTMINER_DIGESTAUTH.request({
    headers: { Accept: "application/json" },
    method: "GET",
    url: `http://${minerIpAddress}/cgi-bin/pools.cgi`,
  }).then((res: any) => {
    const currentPoolInfo = res.data["POOLS"][0];
    console.log("isAntminerOnline");
    console.log(res.data);
    return currentPoolInfo.status == "Alive" && currentPoolInfo.priority == 0;
  });
}
