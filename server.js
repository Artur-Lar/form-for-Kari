const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const auth = new google.auth.GoogleAuth({
  keyFile: "", // Путь к JSON ключу
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

app.post("/submit_form", async (req, res) => {
  const { mail, choice, checks, scale } = req.body;

  console.log("Полученные данные из формы:", { mail, choice, checks, scale });

  try {
    const spreadsheetId = ""; // ID таблицы (смотреть из командной строки в окне с таблицей)

    const checksFormatted = Array.isArray(checks) ? checks.join(", ") : checks;

    const values = [[mail, choice, checksFormatted, scale]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1:D1",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    console.log(
      "Данные успешно добавлены в таблицу Google Sheets:",
      response.data
    );
    res.send("Данные успешно отправлены в Google Таблицы!");
  } catch (err) {
    console.error("Ошибка при отправке данных в Google Таблицы:", err);
    res
      .status(500)
      .send("Произошла ошибка при отправке данных в Google Таблицы.");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
