const login = require("fca-project-orion");
const fs = require("fs-extra");
const express = require("express");

const app = express();
app.get("/", (req, res) => res.send("বট রানিং!"));
app.listen(process.env.PORT || 8080);

console.log("------------------------------------------");
console.log("ওস্তাদ, সিস্টেম চেক করা হচ্ছে...");

if (!fs.existsSync("./appstate.json")) {
    console.error("এরর: appstate.json ফাইল পাওয়া যায়নি!");
    process.exit(1); 
}

const appState = JSON.parse(fs.readFileSync("./appstate.json", "utf8"));

login({ appState }, (err, api) => {
    if (err) {
        console.error("লগইন এরর! কুকি চেক করুন।");
        process.exit(1);
    }

    console.log("অভিনন্দন! ফেসবুক লগইন সাকসেসফুল। 🔥");

    api.listenMqtt((err, event) => {
        if (err) return;
        if (event.type === "message" && event.body) {
            const msg = event.body.trim().toLowerCase();
            if (msg === "/bot") {
                api.sendMessage("Success! ওস্তাদ রুহিনের বট এখন এই গ্রুপে ফুল অ্যাক্টিভ। 🦾", event.threadID);
            }
        }
    });
});
