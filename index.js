const {
  default: makeWASocket,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Bot Running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    const phoneNumber = "212711888511";
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("PAIRING CODE:", code);
  }

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (text === "ping") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "pong 🏓",
      });
    }
  });
}

startBot();
