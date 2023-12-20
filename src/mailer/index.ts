import { PerformanceRecord } from "@/performance/performance";
import { json2csv } from "json-2-csv";
import { createTransport } from "nodemailer";

export async function sendPerformanceReportEmail({
  identifier,
  timeSpan,
  jsonReport,
}: {
  identifier: string;
  timeSpan: { startTime: Date; endTime: Date };
  jsonReport: PerformanceRecord[];
}) {
  const transport = getTransport();
  await transport.sendMail({
    to: identifier,
    from: "tech@weminetogether.com",
    subject: `Monthly Performance Report`,
    text: `The appended monthly report aggregates performance records:
     From ${timeSpan.startTime}
     Tp ${timeSpan.endTime}`,
    attachments: [
      {
        filename: "weminex-performance-report.csv",
        content: await json2csv(jsonReport),
      },
    ],
  });
}

function getTransport() {
  return createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "tech@weminetogether.com",
      clientId:
        "743702167573-k6r9vrc98ln69nup15as4cacejg5l5pc.apps.googleusercontent.com",
      clientSecret: "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",
      refreshToken:
        "1//0dnJ6PNtgLD5vCgYIARAAGA0SNwF-L9IrCt6DRYz37tX5B-EKQvApckpYuEF_jAYIJn8KGM16CwLNiC_Xajr0cVTNalDhYhoLWz4",
      accessToken:
        "ya29.a0AbVbY6MPp4Ae6uATeHsiBnz59qwpjgKstzjR80k1fGac4C4_AragTczSh1mWwl5mrBi0nPgMKt_1BsjLBUejMYxXNzkv3ZsUJxe9ne2Ir-QHo7idC3zMHdWz-TcMLyxKNvs166-E50avl-ddfJiycDLGvykIaCgYKAbYSARMSFQFWKvPlx3JG4ARJp8gl99NnQjGsmA0163",
      expires: 1690158947105,
    },
  });
}
