import { FARM_METRICS_APP_ID } from "../../config";
import { loadFarmMetricsAppAuthsModel } from "../models/farm-metrics-app-auths";
import { loadFarmMgmtAppAuthsModel } from "../models/farm-mgmt-app-auths";

export async function getValidAccessToken(appId: string) {
  const appAuthInfo = await getAppAuthInfo(appId);
  return appAuthInfo.access_token;
}

async function getAppAuthInfo(appId: string) {
  switch (appId) {
    case FARM_METRICS_APP_ID:
      return await loadFarmMetricsAppAuthsModel().findOne();
    default:
      return await loadFarmMgmtAppAuthsModel().findOne();
  }
}
