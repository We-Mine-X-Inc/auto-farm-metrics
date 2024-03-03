import { GLOBAL_CONFIGS_DATABASE } from "../../config";
import { Schema, Document } from "mongoose";
import { FarmMetricsAppAuths } from "wemine-apis";
import { dbConnections } from "../clients/mongoose";

const farmMetricsAppAuthsSchema: Schema = new Schema({
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  device_id: {
    type: String,
    required: true,
  },
});

export function loadFarmMetricsAppAuthsModel() {
  const globalConfigsDb = dbConnections[GLOBAL_CONFIGS_DATABASE as string]();
  return (
    globalConfigsDb.models["FarmMetricsAppAuths"] ||
    globalConfigsDb.model<FarmMetricsAppAuths & Document>(
      "FarmMetricsAppAuths",
      farmMetricsAppAuthsSchema
    )
  );
}
