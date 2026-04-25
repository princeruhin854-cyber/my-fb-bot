const login = require("fca-project-orion");
const fs = require("fs-extra");
const express = require("express");

// ১. সার্ভার সেটআপ (যাতে গিটহাব বা রেন্ডার এটাকে সচল রাখে)
const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("ওস্তাদ, আপনার ফেসবুক বট সার্ভার বর্তমানে সচল আছে! 🔥");
});

app.listen(port, () => {
    console.log(`সার্ভার চলছে পোর্ট: ${port}`);
});

// ২. মেইন বট ফাংশন
function startBot() {
    // appstate.json চেক করা
    if (!fs.existsSync("./appstate.json")) {
        console.error("এরর: appstate.json ফাইলটি পাওয়া যায়নি!");
        return;
    }

    const appState = JSON.parse(fs.readFileSync("./appstate.json", "utf8"));

    // লগইন কনফিগারেশন
    const options = {
        forceLogin: true,
        listenEvents: true,
        logLevel: "silent",
        selfListen: false, // নিজের মেসেজে নিজে রিপ্লাই দিবে না
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    };

    login({ appState: appState }, options, (err, api) => {
        if (err) {
            console.error("লগইন এরর: কুকি মেয়াদোত্তীর্ণ বা ভুল! নতুন কুকি দিন।");
            return;
        }

        console.log("------------------------------------------");
        console.log("অভিনন্দন ওস্তাদ! ফেসবুক লগইন সাকসেসফুল। 😎");
        console.log("বট এখন আপনার গ্রুপ ও ইনবক্সে কমান্ডের অপেক্ষায়...");
        console.log("------------------------------------------");

        // ৩. মেসেজ লিসেনার (MQTT)
        api.listenMqtt((err, event) => {
            if (err) return console.error("লিসেনার এরর:", err);

            // শুধু টেক্সট মেসেজ আসলে প্রসেস করবে
            if (event.type === "message" && event.body) {
                const message = event.body.trim().toLowerCase();
                const senderID = event.senderID;
                const threadID = event.threadID;

                // --- কমান্ড সেকশন ---

                // ১. আপনার কাঙ্ক্ষিত /bot কমান্ড
                if (message === "/bot") {
                    api.sendMessage("Success! ওস্তাদ রুহিনের বট এখন এই গ্রুপে ফুল অ্যাক্টিভ। 🦾🔥", threadID);
                }

                // ২. নিউজ কমান্ড (আপনার নিউজ পোর্টালের জন্য)
                else if (message === "/news") {
                    api.sendMessage("আজকের খবর: কমলগঞ্জ নিউজ পোর্টালে নতুন আপডেট এসেছে। চেক করুন: komolgongnews.page.gd", threadID);
                }

                // ৩. ম্যাথ হেল্প (SSC 2026 প্রিপারেশন)
                else if (message === "/math") {
                    api.sendMessage("ওস্তাদ, আমি আপনার গণিতের পরিসংখ্যান (Statistics) এবং বীজগণিত সমাধানে সাহায্য করতে পারি। আপনার সমস্যাটি বলুন। 📐", threadID);
                }

                // ৪. সাধারণ হাই-হ্যালো
                else if (message === "hi" || message === "hello") {
                    api.sendMessage("আসসালামু আলাইকুম ওস্তাদ! আমি রুহিন আহমেদের তৈরি সাইবার বট। কীভাবে সাহায্য করতে পারি?", threadID);
                }
            }
        });
    });
}

// ৪. বট চালু করা
startBot();

// ৫. এরর হলে অটো রিস্টার্ট (অপশনাল কিন্তু কাজের)
process.on('unhandledRejection', (err, p) => {
    console.log('Unhandled Rejection at: ', p, 'reason: ', err);
});
