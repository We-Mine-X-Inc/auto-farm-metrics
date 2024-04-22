import { WEMINE_NODE_ENV } from "../../config";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { HostedMiner } from "wemine-apis";
import {
  getHostedMiners,
  getHostedMinerGraphSchemaName,
} from "wemine-common-utils";

export async function getHostedMinersRpc({
  clientPromise,
  query = {},
}: {
  query?: Omit<any, "_id">;
  clientPromise: Promise<ApolloClient<NormalizedCacheObject>>;
}) {
  const client = await clientPromise;
  const hostedMinersFetchResult = await client.query({
    query: getHostedMiners({ env: WEMINE_NODE_ENV, query }),
  });
  const schemaName = getHostedMinerGraphSchemaName(WEMINE_NODE_ENV, {
    forManyDocuments: true,
  });
  const hostedMiner = hostedMinersFetchResult.data[schemaName] as HostedMiner[];
  return hostedMiner;
}
