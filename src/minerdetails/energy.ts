import { getEmqxConnection } from "@/iot/emqx-connection";

const ENERGY_TOTAL_FIELD = "EnergyTotal";
const ENERGY_TOTAL_SUBFIELD_TOTAL = "Total";
const WAIT_TIME_FOR_ENERGY_RESPONSE = 5000; // 5 seconds

export async function getEnergyTotal(friendlyMinerId: string) {
  const emqxConnection = await getEmqxConnection();
  return new Promise<number>((resolve, reject) => {
    // Register callback to handle capturing the given miner's energy total.
    emqxConnection.on("message", (topic, payload) => {
      if (topic.includes(friendlyMinerId)) {
        const jsonPayload = JSON.parse(payload.toString());
        emqxConnection.end();
        resolve(jsonPayload[ENERGY_TOTAL_FIELD][ENERGY_TOTAL_SUBFIELD_TOTAL]);
      }
    });

    // Publish MQTT message in order to trigger the above callback.
    emqxConnection.publish(
      `cmnd/pow_elite_${friendlyMinerId}_topic/EnergyTotal`,
      ""
    );

    setTimeout(
      () => reject(`Timeout: No energy response for ${friendlyMinerId}.`),
      WAIT_TIME_FOR_ENERGY_RESPONSE
    );
  });
}
