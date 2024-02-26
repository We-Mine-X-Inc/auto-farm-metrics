import { format as prettyFormat } from "pretty-format";
import { MinerOperationalInfo } from "./common-types";
import { GIGA_TO_TERA_HASHRATE_FACTOR } from "wemine-common-utils";
const { exec } = require("child_process");

export async function getBraiinsInfo(
  minerIpAddress: string
): Promise<MinerOperationalInfo> {
  const poolUser = await getBraiinsPool(minerIpAddress);
  const hashrate =
    (await getBraiinsHashRate(minerIpAddress)) / GIGA_TO_TERA_HASHRATE_FACTOR;
  return { poolUser, hashrate, isOnline: hashrate > 0 };
}

async function getBraiinsPool(minerIpAddress: string) {
  const minerIP = minerIpAddress;
  const getPoolsCommand = `echo '{"command":"pools"}' | nc ${minerIP} 4028 | jq .`;

  /**
   * TEST WHETHER OR NOT THE RETURN VALUES ARE SURFACED, OR IF I NEED TO USE STORED VARIABLES
   * TO CAPTURE THE INFORMATION.
   */
  return new Promise<string>((resolve) => {
    exec(getPoolsCommand, (error: any, stdout: any, stderr: any) => {
      const poolConfiguration = JSON.parse(stdout)["POOLS"];
      if (poolConfiguration.length != 1) {
        throw Error(`There's either no pool configuration or too many are set: 
        ${prettyFormat(poolConfiguration)}`);
      }
      resolve(poolConfiguration[0].User);
    });
  });
}

export async function getBraiinsHashRate(minerIpAddress: string) {
  const minerIP = minerIpAddress;
  const getSummaryCommand = `echo '{"command":"summary"}' | nc ${minerIP} 4028 | jq .`;
  return new Promise<number>((resolve) => {
    exec(getSummaryCommand, (error: any, stdout: any, stderr: any) => {
      const minerStats = JSON.parse(stdout);
      resolve(parseFloat(minerStats["SUMMARY"][0]["MHS 5s"]));
    });
  });
}
