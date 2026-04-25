const login = require("fca-unofficial");
const fs = require("fs");

// GitHub Secrets (APPSTATE) অথবা লোকাল appstate.json থেকে কুকি রিড করবে
let appStateData;
try {
    if (process.env.APPSTATE) {
        appStateData = JSON.parse(process.env.APPSTATE);
    } else {
        appStateData = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
    }
} catch (error) {
    console.error("❌ AppState লোড করতে সমস্যা হয়েছে! তোমার JSON ডেটা ঠিক আছে কিনা চেক করো।", error);
    process.exit(1);
}

// ফেসবুকে লগিন করার ফাংশন
login({ appState: appStateData }, (err, api) => {
    if (err) {
        console.error("❌ লগিন ফেইল হয়েছে: ", err);
        return;
    }

    console.log("✅ বট সফলভাবে লগিন হয়েছে এবং মেসেজ শোনার জন্য প্রস্তুত!");

    // মেসেজ শোনার ফাংশন
    api.listenMqtt((err, message) => {
        if (err) return console.error(err);

        // কেউ যদি টেক্সট মেসেজ দেয়, তবেই রিপ্লাই করবে
        if (message.type === "message") {
            const userMessage = message.body.toLowerCase(); // মেসেজ ছোট হাতের অক্ষরে কনভার্ট করা

            // 'hi' বা 'hello' লিখলে বটের রিপ্লাই
            if (userMessage === "hi" || userMessage === "hello") {
                api.sendMessage("হ্যালো! আমি একটি অটোমেটিক চ্যাটবট। বলো তোমাকে কীভাবে সাহায্য করতে পারি?", message.threadID);
            }
            
            // 'কেমন আছ' লিখলে বটের রিপ্লাই
            else if (userMessage === "kemon acho" || userMessage === "কেমন আছো") {
                api.sendMessage("আমি ভালো আছি! তুমি কেমন আছো?", message.threadID);
            }
        }
    });
});
