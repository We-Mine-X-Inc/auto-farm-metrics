import { getEmqxConnection } from "@/iot/emqx-connection";

const ENERGY_TOTAL_FIELD = "EnergyTotal";
const ENERGY_TOTAL_SUBFIELD_TOTAL = "Total";
const WAIT_TIME_FOR_ENERGY_RESPONSE = 300000; // 5 mins

export async function getEnergyTotal(friendlyMinerId: string) {
  const emqxConnection = await getEmqxConnection();
  return new Promise<number>((resolve, reject) => {
    // Register callback to handle capturing the given miner's energy total.
    emqxConnection.on("message", (topic, payload) => {
      if (topic.includes(friendlyMinerId)) {
        const jsonPayload = JSON.parse(payload.toString());
        resolve(jsonPayload[ENERGY_TOTAL_FIELD][ENERGY_TOTAL_SUBFIELD_TOTAL]);
      }
    });

    // Publish MQTT message in order to trigger the above callback.
    emqxConnection.publish(
      `cmnd/pow_elite_${friendlyMinerId}_topic/EnergyTotal`,
      "",
      { qos: 1 }
    );

    setTimeout(
      () => reject(`Timeout: No energy response for ${friendlyMinerId}.`),
      WAIT_TIME_FOR_ENERGY_RESPONSE
    );
  });
}
