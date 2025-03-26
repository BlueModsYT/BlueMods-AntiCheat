import { system } from "@minecraft/server";

const Plugins = ["main.js"];

// All rights reserved @bluemods.lol - Discord account. Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

(async function loadPlugins() {
    await system.waitTicks(0);

    for (const plugin of Plugins) {
        const start = Date.now();

        import(`./${plugin}`)
            .then(() => {
                console.warn(
                    `§aLoaded Plugin: §e${plugin}§a Successfully, in §e${Date.now() - start} ms§r`
                );
            })
            .catch((error) => {
                console.warn(
                    `Error on Loading Plugin ${plugin}: ` + error + error.stack
                );
            });
    }
})();

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true;
});
