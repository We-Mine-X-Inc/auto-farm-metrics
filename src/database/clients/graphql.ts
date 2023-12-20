import { GraphQLAccessors, constructGraphqlClients } from "wemine-common-utils";
import { FARM_METRICS_APP_ID, FARM_MGMT_APP_ID } from "@/config";
import { loadFarmMetricsAppAuthsModel } from "../models/farm-metrics-app-auths";
import { loadFarmMgmtAppAuthsModel } from "../models/farm-mgmt-app-auths";

export let graphqlClients: GraphQLAccessors = {};

export function constructClients() {
  graphqlClients = constructGraphqlClients([
    {
      appId: FARM_MGMT_APP_ID as string,
      getAppAuthInfo: async () => {
        return await loadFarmMgmtAppAuthsModel()
          .findOne()
          .then((appAuth: { access_token: string }) => {
            return { access_token: appAuth.access_token };
          });
      },
    },
    {
      appId: FARM_METRICS_APP_ID as string,
      getAppAuthInfo: async () => {
        return await loadFarmMetricsAppAuthsModel()
          .findOne()
          .then((appAuth: { access_token: string }) => {
            return { access_token: appAuth.access_token };
          });
      },
    },
  ]);
}
