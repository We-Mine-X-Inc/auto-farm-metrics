const axios = require("axios").default;

const GOLDSHELL_DEFAULTS = {
  POOL_PWD: "123",
  MINER_USERNAME: "admin",
  MINER_PWD: "123456789",
};

type SessionInfo = {
  ipAddress: string;
  authToken: string;
};

async function loginToMiner(ipAddress: string): Promise<SessionInfo> {
  return await axios({
    method: "get",
    url: `http://${ipAddress}/user/login?username=${GOLDSHELL_DEFAULTS.MINER_USERNAME}&password=${GOLDSHELL_DEFAULTS.MINER_PWD}`,
  }).then((res: any) => {
    return { ipAddress: ipAddress, authToken: res.data["JWT Token"] };
  });
}

export async function getGoldshellInfo(minerIpAddress: string): Promise<any> {
  const sessionInfo = await loginToMiner(minerIpAddress);
  const poolStatus = await getGoldshellPoolStatus(sessionInfo);
  const hashrate = await getGoldshellHashRate(sessionInfo);
  return {
    poolUser: poolStatus.poolUser,
    isOnline: poolStatus.isOnline,
    hashrate,
  };
}

async function getGoldshellPoolStatus(sessionInfo: SessionInfo) {
  return await axios({
    method: "get",
    url: `http://${sessionInfo.ipAddress}/mcb/pools`,
    headers: getRequestHeaders(sessionInfo.authToken),
  }).then((res: any) => {
    const currentPoolInfo = res.data[0];
    return {
      poolUser: currentPoolInfo.user,
      isOnline: currentPoolInfo.active && currentPoolInfo["pool-priority"] == 0,
    };
  });
}

export async function getGoldshellHashRate(sessionInfo: SessionInfo) {
  return await axios({
    method: "get",
    url: `http://${sessionInfo.ipAddress}/mcb/cgminer?cgminercmd=devs`,
    headers: getRequestHeaders(sessionInfo.authToken),
  }).then((res: any) => {
    const chipStats = res.data["data"];
    const chipHashRates = chipStats.map(
      (chipStat: any) => chipStat["hashrate"]
    );
    return chipHashRates.reduce(
      (partialSum: number, a: number) => partialSum + a,
      0
    );
  });
}

function getRequestHeaders(authToken: string) {
  return {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Connection: "keep-alive",
  };
}
