import { Command } from "../CommandHandler.js";
import { system } from "@minecraft/server";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

Command.register({
    name: "ping",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;

    let ticksPerSecond = 20;
    let tickInterval = system.currentTick % 20;

    let worldPing = Math.round(ticksPerSecond - tickInterval) * 50;
    let worldTPS = Math.min(20, ticksPerSecond);

    let pingStatus = "§aHigh";
    if (worldPing > 150) {
        pingStatus = "§cLow";
    } else if (worldPing > 75) {
        pingStatus = "§gMedium";
    }

    player.sendMessage(`§7[§a#§7] §aPing§7: §e${worldPing}ms §7[${pingStatus}§7] | §aTPS: §e${worldTPS}§7/§e20`);
    player.runCommandAsync(`playsound random.orb @s`);
});
