import { getEmqxConnection } from "../iot/emqx-connection";

const STATUS_COMMAND_PAYLOAD = "8";
const STATUS_FIELD = "StatusSNS";
const ENERGY_SUBFIELD = "ENERGY";
const POWER_SUBFIELD = "Power";
const ENERGY_TOTAL_SUBFIELD = "Total";
const WAIT_TIME_FOR_STATUS_RESPONSE = 300000; // 5 mins

type EnergyStats = { energyTotal: number; activePower: number };

export async function getEnergyStats(friendlyPowerControllerId: string) {
  const emqxConnection = await getEmqxConnection();
  return new Promise<EnergyStats>((resolve, reject) => {
    // Register callback to handle capturing the given miner's energy total.
    emqxConnection.on("message", (topic, payload) => {
      if (
        topic.includes(friendlyPowerControllerId) &&
        topic.includes("STATUS8")
      ) {
        let jsonPayload;
        try {
          jsonPayload = JSON.parse(payload.toString());

          if (jsonPayload[STATUS_FIELD]) {
            resolve({
              energyTotal:
                jsonPayload[STATUS_FIELD][ENERGY_SUBFIELD][
                  ENERGY_TOTAL_SUBFIELD
                ],
              activePower:
                jsonPayload[STATUS_FIELD][ENERGY_SUBFIELD][POWER_SUBFIELD],
            });
          }
        } catch (error) {
          reject(error);
        }
      }
    });

    // Publish MQTT message in order to trigger the above callback.
    emqxConnection.publish(
      `cmnd/pow_elite_${friendlyPowerControllerId}_topic/Status`,
      STATUS_COMMAND_PAYLOAD,
      { qos: 1 }
    );

    setTimeout(
      () =>
        reject(`Timeout: No status response for ${friendlyPowerControllerId}.`),
      WAIT_TIME_FOR_STATUS_RESPONSE
    );
  });
}
