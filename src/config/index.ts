import { config } from "dotenv";
import { EnvironmentString, convertStringToEnum } from "wemine-common-utils";
config({ path: `.env.${process.env["NODE_ENV"] || "development"}.local` });

export const CREDENTIALS = process.env["CREDENTIALS"] === "true";

export const WEMINE_NODE_ENV = convertStringToEnum(
  process.env["NODE_ENV"] as EnvironmentString
);

export const {
  // In-app Configurations
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,

  // Common Database Info
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_IS_SRV,
  DB_PASSWORD,
  DB_CLUSTER,

  // Databases
  GLOBAL_CONFIGS_DATABASE,
  FARM_MGMT_DATABASE,
  FARM_METRICS_DATABASE,

  // App Ids
  FARM_METRICS_APP_ID,
  FARM_MGMT_APP_ID,

  // Agenda Configurations
  AGENDA_MAX_OVERALL_CONCURRENCY,
  AGENDA_MAX_SINGLE_JOB_CONCURRENCY,

  // EMQX Configs
  EMQX_PROTOCOL,
  EMQX_HOST,
  EMQX_PORT,
  EMQX_USERNAME,
  EMQX_PASSWORD,
} = process.env;
