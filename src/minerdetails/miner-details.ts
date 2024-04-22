import { MinerApiType } from "wemine-apis";
import { getAntminerInfo } from "./antminer-commands";
import { getBraiinsInfo } from "./braiins-commands";
import { getEnergyStats } from "./energy";
import { MinerDetails, MinerInfo, MinerOperationalInfo } from "./common-types";
import { getGoldshellInfo } from "./goldshell-commands";
import { logger } from "../logger/logger";

const FRIENDLY_POOL_ID_REGEX =
  /(?:\w+)(?:\+\w+)?\.(co-fee|co|cl)-(?<friendlyPoolId>\w+)-(?<friendlyMinerId>\w+)/g;

const UNHEALTHY_MINER_POWER_USAGE = 2000;

export async function getMinerDetails(
  minerInfo: MinerInfo
): Promise<MinerDetails> {
  const minerOperationalInfo = await getOperationalInfo(minerInfo);

  FRIENDLY_POOL_ID_REGEX.lastIndex = 0;
  const matchedGroups = FRIENDLY_POOL_ID_REGEX.exec(
    minerOperationalInfo.poolUser
  )?.groups;
  const friendlyPoolId = matchedGroups
    ? matchedGroups["friendlyPoolId"]
    : undefined;
  const hashrate = Number.isNaN(minerOperationalInfo.hashrate)
    ? undefined
    : minerOperationalInfo.hashrate;
  const energyStats = await getEnergyStats(minerInfo.friendlyPowerControllerId)
    .then(({ energyTotal, activePower }) => {
      return { totalEnergyConsumption: energyTotal, activePower };
    })
    .catch((error) => {
      logger.error(error);
    });
  return {
    friendlyPoolId,
    hashrate,
    isOperational:
      minerOperationalInfo.isOnline &&
      !!energyStats &&
      energyStats.activePower > UNHEALTHY_MINER_POWER_USAGE,
    totalEnergyConsumption: energyStats?.totalEnergyConsumption,
  };
}

async function getOperationalInfo(
  minerInfo: MinerInfo
): Promise<MinerOperationalInfo> {
  switch (minerInfo.API) {
    case MinerApiType.ANTMINER:
      return await getAntminerInfo(minerInfo.ipAddress);
    case MinerApiType.BRAIINS:
      return await getBraiinsInfo(minerInfo.ipAddress);
    case MinerApiType.GOLDSHELL:
      return await getGoldshellInfo(minerInfo.ipAddress);
    default:
      return {
        poolUser: "Unsupported Miner",
        hashrate: NaN,
        isOnline: false,
      };
  }
}
