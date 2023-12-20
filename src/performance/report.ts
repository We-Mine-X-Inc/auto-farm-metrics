import getMinerPerformanceForTimeSpan from "./performance";

export default async function getMinerPerformanceReport({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date;
}) {
  const miningWorks = await getMinerPerformanceForTimeSpan({
    startTime,
    endTime,
  });
  return miningWorks;
}
