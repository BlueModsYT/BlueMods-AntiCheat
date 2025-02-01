import { system, world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

function isCommandEnabled(commandName) {
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;
}

const isAuthorized = (player, commandName) => {
    if (!isCommandEnabled(commandName)) {
        player.sendMessage(`§7[§b#§7] §cThis command §e${commandName} §cis currently disabled.`);
        player.runCommandAsync(`playsound random.break @s`);
        return false;
    }
    return true;
};

const COOLDOWN_TIME = 2 * 60 * 60 * 1000;
const PLAYER_COOLDOWN_KEY = "echestCooldown";

Command.register({
    name: "echest",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "!echest")) return;
    const playerKey = `${player.id}:${PLAYER_COOLDOWN_KEY}`;

    const lastClaimTime = world.getDynamicProperty(playerKey) || 0;
    const currentTime = Date.now();

    if (lastClaimTime && currentTime - lastClaimTime < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (currentTime - lastClaimTime)) / 60000);
        const hours = Math.floor(remainingTime / 60);
        const minutes = remainingTime % 60;

        player.sendMessage(
            `§7[§b#§7] §cYou must wait §e${hours}h ${minutes}m §cto use the Ender Chest again.`
        );
        player.runCommandAsync("playsound random.break @s");
        return;
    }

    player.runCommandAsync("give @s ender_chest 1")
        .then(() => {
            player.sendMessage("§7[§a/§7] §aYou have received an Ender Chest!");
            player.runCommandAsync("playsound random.levelup @s");

            world.setDynamicProperty(playerKey, currentTime);
        })
        .catch((error) => {
            player.sendMessage("§7[§c-§7] §cFailed to give an Ender Chest. Please try again.");
            console.error(`Error giving ender chest: ${error.message}`);
        });
});
