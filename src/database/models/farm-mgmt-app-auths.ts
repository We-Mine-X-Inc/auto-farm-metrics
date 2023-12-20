import mongoose, { model, Schema, Document } from "mongoose";
import { FarmMgmtAppAuths } from "wemine-apis";
import { dbConnections } from "../clients/mongoose";
import { GLOBAL_CONFIGS_DATABASE } from "@/config";

const farmMgmtAppAuthsSchema: Schema = new Schema({
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

export function loadFarmMgmtAppAuthsModel() {
  const globalConfigsDb = dbConnections[GLOBAL_CONFIGS_DATABASE as string]();
  return (
    globalConfigsDb.models["FarmMgmtAppAuths"] ||
    globalConfigsDb.model<FarmMgmtAppAuths & Document>(
      "FarmMgmtAppAuths",
      farmMgmtAppAuthsSchema
    )
  );
}
