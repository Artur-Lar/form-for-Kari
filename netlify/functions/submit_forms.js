const { google } = require("googleapis");

const credentials = {
  type: "service_account",
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, "\n"),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.client_x509_cert_url,
};

const jwtClient = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const spreadsheetId = "1QRg4jTuX3duOFIRhFayj6baiGt-qFTp4H50rjwEgYEA";
const sheetName = "Sheet1";

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { mail, choice, checks, scale } = body;

  const formData = [mail, choice, checks.join(", "), scale];

  try {
    await jwtClient.authorize();
    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A:D`,
      valueInputOption: "RAW",
      resource: {
        values: [formData],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Form data successfully submitted",
        updates: response.data.updates,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error appending data to sheet", error }),
    };
  }
};
