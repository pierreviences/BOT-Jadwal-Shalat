import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import moment from "moment-timezone";
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect?.error,
        ", reconnecting ",
        shouldReconnect
      );
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });
  sock.ev.on("messages.upsert", async (m) => {});
}

function processData(data: any) {
  return `Waktu Shalat Hari ini
  \n\nSubuh : ${processTime(data.fajr)}
Dzuhur  : ${processTime(data.dhuhr)}
Ashar   : ${processTime(data.asr)}
Maghrib : ${processTime(data.maghrib)}
Isya    : ${processTime(data.isha)}`;
}
function processTime(time: any) {
  return moment(time).tz("Asia/Jakarta").format("HH:mm") + " WIB";
}

connectToWhatsApp();
