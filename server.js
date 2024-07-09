require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
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
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const jwtClient = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const spreadsheetId = "1QRg4jTuX3duOFIRhFayj6baiGt-qFTp4H50rjwEgYEA";
const sheetName = "Sheet1";

app.post("/submit_form", (req, res) => {
  const { mail, choice, checks, scale } = req.body;

  const formData = [mail, choice, checks.join(", "), scale];

  jwtClient.authorize((err, tokens) => {
    if (err) {
      console.error("Error authorizing JWT", err);
      res.status(500).send("Error authorizing JWT");
      return;
    }

    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    sheets.spreadsheets.values.append(
      {
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A:D`,
        valueInputOption: "RAW",
        resource: {
          values: [formData],
        },
      },
      (err, result) => {
        if (err) {
          console.error("Error appending data to sheet", err);
          res.status(500).send("Error appending data to sheet");
          return;
        }

        console.log(
          "Data successfully appended to sheet:",
          result.data.updates
        );
        res.send("Form data successfully submitted");
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
