import { Agenda } from "@hokify/agenda";
import {
  AGENDA_MAX_OVERALL_CONCURRENCY,
  AGENDA_MAX_SINGLE_JOB_CONCURRENCY,
  FARM_METRICS_APP_ID,
  FARM_MGMT_APP_ID,
  WEMINE_NODE_ENV,
} from "@config";
import {
  ONE_HOUR_IN_MILLIS,
  agendaSchedulerManager,
  getHostedMiners,
  insertMiningWork,
} from "wemine-common-utils";
import { graphqlClients } from "@/database/clients/graphql";
import { getMinerDetails } from "@/minerdetails/miner-details";
import { MinerDetails } from "@/minerdetails/common-types";
import { defaultDbOptions } from "@/database/clients/mongoose";
import { HostedMiner } from "wemine-apis";

const JOB_NAMES = {
  COLLECT_MINING_WORK: "Collect Mining Work",
};

let miningWorkCollectorScheduler: MiningWorkCollectorScheduler;

class MiningWorkCollectorScheduler {
  private scheduler: Agenda = agendaSchedulerManager.create({
    maxConcurrency: AGENDA_MAX_OVERALL_CONCURRENCY,
    defaultConcurrency: AGENDA_MAX_SINGLE_JOB_CONCURRENCY,
    db: {
      address: defaultDbOptions.url,
      collection: "miningWorkCollectorJobs",
    },
  });
  private isSchedulerStarted: boolean = false;

  static get(): MiningWorkCollectorScheduler {
    if (miningWorkCollectorScheduler) {
      return miningWorkCollectorScheduler;
    }
    miningWorkCollectorScheduler = new MiningWorkCollectorScheduler();
    return miningWorkCollectorScheduler;
  }

  private constructor() {
    this.loadTasksDefinitions();
  }

  /**
   * Loads all of the task definitions needed for pool switching operations.
   */
  private loadTasksDefinitions() {
    this.loadMiningWorkCollectorTask();
  }

  private loadMiningWorkCollectorTask() {
    this.scheduler.define(JOB_NAMES.COLLECT_MINING_WORK, async (job) => {
      const client = await graphqlClients[FARM_MGMT_APP_ID as string]();

      const {
        data: { hostedminerDevs: miners },
      } = await client.query({
        query: getHostedMiners({ env: WEMINE_NODE_ENV, query: {} }),
      });

      const timeStamp = new Date().toISOString();
      return await Promise.all<MinerDetails[]>(
        miners.map(async (miner: HostedMiner) => {
          const minerDetails = await getMinerDetails({
            API: miner.API,
            ipAddress: miner.ipAddress,
            friendlyMinerId: miner.friendlyMinerId,
          });
          console.log("minerDetails");
          console.log(minerDetails);
          // const client = await graphqlClients[FARM_METRICS_APP_ID as string]();
          // await client.mutate({
          //   mutation: insertMiningWork(WEMINE_NODE_ENV),
          //   variables: {
          //     timeISOString: timeStamp,
          //     hashrate: minerDetails.hashrate,
          //     isOnline: minerDetails.isOnline,
          //     totalEnergyConsumption: minerDetails.totalEnergyConsumption,
          //     friendlyPoolId: minerDetails.friendlyPoolId,
          //     friendlyMinerId: miner.friendlyMinerId,
          //   },
          // });
          return minerDetails;
        })
      );
    });
  }

  public async startScheduler() {
    if (this.isSchedulerStarted) {
      return;
    }

    await this.scheduler.start();
    await this.scheduler.every(
      ONE_HOUR_IN_MILLIS,
      // 5 * 1000,
      JOB_NAMES.COLLECT_MINING_WORK
    );
    this.isSchedulerStarted = true;
  }
}

export default MiningWorkCollectorScheduler;
