import { MinerApiType } from "wemine-apis";
import { getAntminerInfo } from "./antminer-commands";
import { getBraiinsInfo } from "./braiins-commands";
import { getEnergyTotal } from "./energy";
import { MinerDetails, MinerInfo, MinerOperationalInfo } from "./common-types";
import { getGoldshellInfo } from "./goldshell-commands";
import { format as prettyFormat } from "pretty-format"; //TODO: Remove

const FRIENDLY_POOL_ID_REGEX =
  /(?:\w+)(?:\+\w+)?\.(co_fee|co|cl)_(?<friendlyPoolId>\w+)_(?<friendlyMinerId>\w+)/g;

export async function getMinerDetails(
  minerInfo: MinerInfo
): Promise<MinerDetails> {
  const minerOperationalInfo = await getOperationalInfo(minerInfo);
  console.log("minerOperationalInfo");
  console.log(prettyFormat(minerOperationalInfo));
  const matchedGroups = FRIENDLY_POOL_ID_REGEX.exec(
    "weminex.co_friendlyPoolId_friendlyMinerId"
    // minerOperationalInfo.poolUser
  );
  const friendlyPoolId = !!matchedGroups?.groups
    ? matchedGroups.groups["friendlyPoolId"]
    : "Failed to fetch pool id.";
  return await getEnergyTotal(minerInfo.friendlyMinerId).then(
    (totalEnergyConsumption) => {
      return {
        friendlyPoolId,
        hashrate: minerOperationalInfo.hashrate,
        isOnline: minerOperationalInfo.isOnline,
        totalEnergyConsumption,
      };
    }
  );
}

async function getOperationalInfo(
  minerInfo: MinerInfo
): Promise<MinerOperationalInfo> {
  switch (minerInfo.API) {
    case MinerApiType.ANTMINER:
      console.log("Antminer");
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
