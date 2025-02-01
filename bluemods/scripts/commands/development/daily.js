import { world, system } from '@minecraft/server';
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

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

const COOLDOWN_TIME = 12 * 60 * 60 * 1000;
const PLAYER_COOLDOWN_KEY = "dailyCooldown";

const playerCooldowns = new Map();

Command.register({
    name: "daily",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "!daily")) return;
    const playerKey = `${player.id}:${PLAYER_COOLDOWN_KEY}`;

    const lastClaimTime = playerCooldowns.get(playerKey) || world.getDynamicProperty(playerKey);
    const currentTime = Date.now();

    if (lastClaimTime && currentTime - lastClaimTime < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (currentTime - lastClaimTime)) / 60000);
        const hours = Math.floor(remainingTime / 60);
        const minutes = remainingTime % 60;

        player.sendMessage(
            `§7[§b#§7] §cYou already claimed your daily reward! Try again in ${hours}h ${minutes}m.`
        );
        player.runCommandAsync("playsound random.break @s");
        return;
    }

    const totalChance = main.daily.reduce((sum, reward) => sum + reward.chance, 0);
    const randomValue = Math.random() * totalChance;

    let accumulatedChance = 0;
    let selectedReward;

    for (const reward of main.daily) {
        accumulatedChance += reward.chance;
        if (randomValue <= accumulatedChance) {
            selectedReward = reward;
            break;
        }
    }

    if (!selectedReward) {
        player.sendMessage("§7[§b#§7] §cNo reward could be determined. Please try again later.");
        player.runCommandAsync("playsound random.break @s");
        return;
    }

    player.runCommandAsync(`give @s ${selectedReward.item} ${selectedReward.count}`);
    player.sendMessage(
        `§7[§b#§7] §aCongratulations! You received §e${selectedReward.count} ${selectedReward.item}(s)§a as your daily reward!`
    );
    player.runCommandAsync("playsound random.levelup @s");

    playerCooldowns.set(playerKey, currentTime);
    world.setDynamicProperty(playerKey, currentTime);
});