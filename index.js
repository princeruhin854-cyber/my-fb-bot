const login = require("fca-project-orion");
const fs = require("fs-extra");
const express = require("express");

const app = express();
const port = process.env.PORT || 8080;

// ১. ওয়েব সার্ভার সেটআপ (গিটহাব অ্যাকশনের জন্য)
app.get("/", (req, res) => {
    res.send("ওস্তাদ রুহিনের বট সফলভাবে চলছে! 🔥");
});

app.listen(port, () => {
    console.log(`সার্ভার চালু হয়েছে পোর্ট: ${port}`);
});

// ২. ফেসবুক লগইন ফাংশন
function startBot() {
    // চেক করা হচ্ছে appstate.json ফাইলটি আছে কি না
    if (!fs.existsSync("./appstate.json")) {
        console.error("এরর: appstate.json ফাইলটি খুঁজে পাওয়া যায়নি! আগে এটি তৈরি করুন।");
        return;
    }

    const appState = JSON.parse(fs.readFileSync("./appstate.json", "utf8"));

    login({ appState: appState }, (err, api) => {
        if (err) {
            console.error("লগইন এরর: কুকি হয়তো মেয়াদোত্তীর্ণ হয়ে গেছে। নতুন কুকি দিন।", err);
            return;
        }

        console.log("------------------------------------------");
        console.log("অভিনন্দন ওস্তাদ! ফেসবুক লগইন সাকসেসফুল। 😎");
        console.log("বট এখন আপনার মেসেজ শোনার জন্য প্রস্তুত।");
        console.log("------------------------------------------");

        // ৩. মেসেজ লিসেনার (MQTT)
        api.listenMqtt((err, event) => {
            if (err) return console.error("লিসেনার এরর:", err);

            // কেউ মেসেজ দিলে রিপ্লাই দিবে
            if (event.type === "message" && event.body) {
                const messageBody = event.body.toLowerCase();

                // সাধারণ রিপ্লাই
                if (messageBody === "hi" || messageBody === "hello") {
                    api.sendMessage("কিরে মামা! আমি ওস্তাদ রুহিনের তৈরি সাইবার বট। খবর কী? 🦾", event.threadID);
                }
                
                // আপনার জন্য ম্যাথ টিপস (স্যাম্পল)
                if (messageBody === "/math") {
                    api.sendMessage("ওস্তাদ, গণিতের পরিসংখ্যানের অংক করতে চাইলে আপনার ডাটাগুলো দিন।", event.threadID);
                }
            }
        });
    });
}

// বট স্টার্ট করা
startBot();

