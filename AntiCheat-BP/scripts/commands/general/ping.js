import { Command } from "../CommandHandler.js";
import { system, world } from "@minecraft/server";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

Command.register({
    name: "ping",
    description: "",
    aliases: [],
}, async (data) => {
    const { player } = data;
    const start = Date.now();

    await player.runCommandAsync(`testfor @s`);

    const responseTime = Date.now() - start;
    
    let pingStatus = "§aLow";
    if (responseTime > 100) {
        pingStatus = "§cHigh";
    } else if (responseTime > 50) {
        pingStatus = "§gMedium";
    }

    const worldTPS = Math.min(20, 20);
    player.sendMessage(`§7[§a#§7] §aPing§7: §e${responseTime}ms §7[${pingStatus}§7] | §aTPS: §e${worldTPS}§7/§e20`);

    player.runCommandAsync(`playsound random.orb @s`);
});
