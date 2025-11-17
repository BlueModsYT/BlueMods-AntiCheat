import { system } from "@minecraft/server";

// All rights reserved @bluemods.lol - Discord account. Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

(async function loadMainPlugin() {
    await system.waitTicks(0);
    const start = Date.now();
    import(`./main.js`)
        .then(() => {
            console.warn(`§7[§bBlueMods§7] §fLoaded Plugin: §emain.js§f Successfully, in §e${Date.now() - start} ms§r`);
        })
        .catch((error) => {
            console.warn(`§7[§bBlueMods§7] §fError on Loading Plugin main.js: §c` + error + error.stack + `§r`);
        });
})();

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true;
});