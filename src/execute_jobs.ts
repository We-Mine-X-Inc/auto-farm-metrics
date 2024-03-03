import { buildDbConnections } from "./database/clients/mongoose";
import { constructClients } from "./database/clients/graphql";
import { logger } from "./logger/logger";
import MiningWorkCollectorScheduler from "./scheduler/mining-work-collector-scheduler";

logger.info("Starting Auto Farm Metrics Jobs!!!");

async function executeFarmMetricsJobs() {
  logger.info("Connect to Databases!!!");
  buildDbConnections();
  constructClients();

  logger.info("Start Metrics Collector!!!");
  await MiningWorkCollectorScheduler.get().startScheduler();
}

executeFarmMetricsJobs();
