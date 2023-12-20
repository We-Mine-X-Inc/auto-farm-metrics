import { mqtt as awsMqtt } from "aws-iot-device-sdk-v2";
import { EMQX_HOST, EMQX_PASSWORD, EMQX_PORT, EMQX_USERNAME } from "@/config";
import { IClientOptions, MqttClient, connect } from "mqtt";

const ALL_STATS_TOPICS = "stat/#";

type EmqtConnectionParams = {
  port: number;
  host: string;
  username: string;
  password: string;
  protocol: string;
};

export const getEmqxConnection = produceEmqxConnectionGetter();

function produceEmqxConnectionGetter() {
  var emqxConnection: MqttClient;
  return async () => {
    if (emqxConnection) return emqxConnection;
    emqxConnection = await buildEmqxConnection({
      protocol: "mqtt",
      host: EMQX_HOST || "",
      port: parseInt(EMQX_PORT || ""),
      username: EMQX_USERNAME || "",
      password: EMQX_PASSWORD || "",
    });
    emqxConnection.subscribe(
      [ALL_STATS_TOPICS],
      { qos: awsMqtt.QoS.AtLeastOnce },
      (error) => {
        if (error) {
          // Log error and trigger AWS notification.
        }
      }
    );
    return emqxConnection;
  };
}

async function buildEmqxConnection(
  connectionParams: EmqtConnectionParams
): Promise<MqttClient> {
  return new Promise<MqttClient>((resolve) => {
    const client = connect(connectionParams as IClientOptions);
    console.log(
      `Connecting to mqtt://${connectionParams.host}:${connectionParams.port}@${connectionParams.username}.`
    );

    client.on("connect", function () {
      console.log(`Connected!`);
      resolve(client);
    });
  });
}
