import { FARM_METRICS_APP_ID, WEMINE_NODE_ENV } from "../config";
import { graphqlClients } from "../database/clients/graphql";
import { Types } from "mongoose";
import { MiningWorkHydrated } from "wemine-apis";
import { getMiningWorkByTimeSpanQuery } from "wemine-common-utils";

export interface PerformanceRecord {
  minerId: Types.ObjectId;
  poolUsername: string;
  totalEnergyConsumption: Number;
  successfullyMinedHours: Number;
  unsuccessfullyMinedHours: Number;
}

export default async function getMinerPerformanceForTimeSpan({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const client = await graphqlClients[FARM_METRICS_APP_ID as string]();
  const {
    data: { miningworks: results },
  } = await client.query({
    query: getMiningWorkByTimeSpanQuery({
      env: WEMINE_NODE_ENV,
      query: {
        startTimeISOString: startTime.toISOString(),
        endTimeISOString: endTime.toISOString(),
      },
    }),
  });

  const workByTimeAndMiner = new Map<Types.ObjectId, MiningWorkHydrated[]>();
  for (var resultIndex = 0; resultIndex < results.length; resultIndex++) {
    const work: MiningWorkHydrated = results[resultIndex];
    const minerId = work.minerByFriendlyId._id;
    const existingWorkListForMiner = workByTimeAndMiner.get(minerId);
    if (existingWorkListForMiner) {
      existingWorkListForMiner.push(work);
    } else {
      workByTimeAndMiner.set(minerId, [work]);
    }
  }

  const performanceData = new Map();
  for (const [minerId, overallWorkList] of workByTimeAndMiner.entries()) {
    const { totalEnergyConsumption: startEnergy } = overallWorkList[0];
    for (const miningWork of overallWorkList) {
      const {
        totalEnergyConsumption: endEnergy,
        poolByFriendlyId,
        isOnline,
      } = miningWork;
      const poolUsername = poolByFriendlyId.username;
      const successfullyMinedHours = isOnline ? 1 : 0;
      const unsuccessfullyMinedHours = isOnline ? 0 : 1;
      const extraEnergyConsumption = isOnline
        ? endEnergy.valueOf() - startEnergy.valueOf()
        : 0;
      const dataKey = JSON.stringify({ minerId, poolUsername });
      if (performanceData.has(dataKey)) {
        const currentPerformanceData = performanceData.get(dataKey);
        currentPerformanceData.totalEnergyConsumption += extraEnergyConsumption;
        currentPerformanceData.successfullyMinedHours += successfullyMinedHours;
        currentPerformanceData.unsuccessfullyMinedHours +=
          unsuccessfullyMinedHours;
      } else {
        performanceData.set(dataKey, {
          minerId,
          poolUsername,
          totalEnergyConsumption: extraEnergyConsumption,
          successfullyMinedHours,
          unsuccessfullyMinedHours,
        });
      }
    }
  }

  return Array.from(performanceData.values());
}
