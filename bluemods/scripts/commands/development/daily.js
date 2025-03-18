import { world, system } from '@minecraft/server';
import { Command } from "../../systems/handler/CommandHandler.js";
import { getRemainingCooldownTime } from "../../systems/handler/ModuleHandler.js";
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

const DAILY_REWARDS_KEY = "dailyRewards";
const DAILY_COOLDOWN_KEY = "dailyCooldown";
let dailyRewards = [];

system.run(() => {
    const storedDailyRewards = world.getDynamicProperty(DAILY_REWARDS_KEY);
    if (!storedDailyRewards) {
        dailyRewards = main.daily;
        world.setDynamicProperty(DAILY_REWARDS_KEY, JSON.stringify(dailyRewards));
    } else {
        dailyRewards = JSON.parse(storedDailyRewards);
    }
});

function claimDailyReward(player) {
    const playerKey = `${player.id}:${DAILY_COOLDOWN_KEY}`;
    const currentTime = Date.now();

    const totalChance = dailyRewards.reduce((sum, reward) => sum + reward.chance, 0);
    const randomValue = Math.random() * totalChance;

    let accumulatedChance = 0;
    let selectedReward;

    for (const reward of dailyRewards) {
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

    world.setDynamicProperty(playerKey, currentTime);
}

Command.register({
    name: "daily",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "!daily")) return;

    const remainingTime = getRemainingCooldownTime(player);
    if (remainingTime > 0) {
        const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        let message = "§7[§b#§7] §cYou already claimed your daily reward! Try again in ";

        if (days > 0) message += `${days}d `;
        if (hours > 0) message += `${hours}h `;
        if (minutes > 0) message += `${minutes}m `;
        if (seconds > 0) message += `${seconds}s`;

        player.sendMessage(message.trim());
        player.runCommandAsync("playsound random.break @s");
        return;
    }

    claimDailyReward(player);
});