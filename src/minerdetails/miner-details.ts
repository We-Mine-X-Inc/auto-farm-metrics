import { MinerApiType } from "wemine-apis";
import { getAntminerInfo } from "./antminer-commands";
import { getBraiinsInfo } from "./braiins-commands";
import { getEnergyTotal } from "./energy";
import { MinerDetails, MinerInfo, MinerOperationalInfo } from "./common-types";
import { getGoldshellInfo } from "./goldshell-commands";

const FRIENDLY_POOL_ID_REGEX =
  /(?:\w+)(?:\+\w+)?\.(co_fee|co|cl)_(?<friendlyPoolId>\w+)_(?<friendlyMinerId>\w+)/g;

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
  const totalEnergyConsumption = await getEnergyTotal(
    minerInfo.friendlyPowerControllerId
  )
    .then((totalEnergyConsumption) => totalEnergyConsumption)
    .catch((error) => undefined);
  return {
    friendlyPoolId,
    hashrate,
    isOnline: minerOperationalInfo.isOnline,
    totalEnergyConsumption,
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
