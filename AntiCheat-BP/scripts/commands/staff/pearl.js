import { world, system } from '@minecraft/server';
import { Command } from "../CommandHandler.js"; // Assuming you have a command handler setup
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

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

const playerCooldowns = new Map();
let defaultCooldownSeconds = 10; // Default cooldown in seconds
const MIN_COOLDOWN_SECONDS = 5;  // Minimum allowed cooldown duration

system.runInterval(() => {
    const currentTick = system.currentTick;

    for (const player of world.getPlayers()) {
        const playerName = player.name;
        const cooldownEndTick = playerCooldowns.get(playerName);

        if (cooldownEndTick && currentTick >= cooldownEndTick) {
            player.sendMessage("§7[§b#§7] §aYou can now use Ender Pearls again!");
            player.runCommandAsync(`playsound note.bell @s`);
            playerCooldowns.delete(playerName);
        }
    }
}, 20);

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const { itemStack } = event;

    if (itemStack.typeId === "minecraft:ender_pearl") {
        const playerName = player.name;
        const currentTick = system.currentTick;

        if (playerCooldowns.has(playerName)) {
            const cooldownEndTick = playerCooldowns.get(playerName);

            if (currentTick < cooldownEndTick) {
                const remainingTicks = cooldownEndTick - currentTick;
                const remainingSeconds = Math.ceil(remainingTicks / 20);

                player.sendMessage(`§7[§b#§7] §cYou are on cooldown for using Ender Pearls! Please wait §e${remainingSeconds} §cseconds.`);
                player.runCommandAsync(`playsound random.break @s`);
                
                event.cancel = true;
                return;
            }
        }

        const cooldownTicks = defaultCooldownSeconds * 20;
        playerCooldowns.set(playerName, currentTick + cooldownTicks);
        player.sendMessage(`§7[§b#§7] §aEnder Pearl used! You are now on a ${defaultCooldownSeconds}-second cooldown.`);
    }
});

Command.register({
    name: "pearl",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),  // Only admins can use this command
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!pearl")) return;
    
    const action = args[0]?.toLowerCase();
    const duration = parseInt(args[1]);

    if (!["set", "remove"].includes(action)) {
        player.sendMessage('§7[§b#§7] §cInvalid action! Use: §3!pearl §eset §7<§aseconds§7> §7/ §3!pearl §cremove');
        return player.runCommandAsync('playsound random.break @s');
    }

    if (action === "set") {
        if (isNaN(duration) || duration < MIN_COOLDOWN_SECONDS) {
            player.sendMessage(`§7[§b#§7] §cInvalid duration! It must be at least §e${MIN_COOLDOWN_SECONDS} §cseconds.`);
            return player.runCommandAsync('playsound random.break @s');
        }

        defaultCooldownSeconds = duration;
        player.sendMessage(`§7[§b#§7] §aEnder Pearl cooldown set to §e${duration} §aseconds.`);
        player.runCommandAsync('playsound random.levelup @s');

    } else if (action === "remove") {
        defaultCooldownSeconds = 10;  // Reset to default 10s
        player.sendMessage(`§7[§b#§7] §aEnder Pearl cooldown reset to default §e${defaultCooldownSeconds} §aseconds.`);
        player.runCommandAsync('playsound random.levelup @s');
    }
});
