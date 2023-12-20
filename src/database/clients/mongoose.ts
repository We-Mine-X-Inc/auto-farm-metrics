import {
  DB_HOST,
  FARM_MGMT_DATABASE,
  GLOBAL_CONFIGS_DATABASE,
  DB_PASSWORD,
  DB_CLUSTER,
  FARM_METRICS_DATABASE,
} from "@config";
import { DatabaseConfigurations, buildConnections } from "wemine-common-utils";

export const defaultDbOptions = {
  url: `mongodb+srv://${DB_HOST}:${DB_PASSWORD}@${DB_CLUSTER}/${FARM_METRICS_DATABASE}`,
};

export var dbConnections: DatabaseConfigurations = {};

export function buildDbConnections() {
  dbConnections = buildConnections({
    defaultDatabaseUrl: defaultDbOptions.url,
    databaseNames: [
      GLOBAL_CONFIGS_DATABASE as string,
      FARM_MGMT_DATABASE as string,
      FARM_METRICS_DATABASE as string,
    ],
  });
}
