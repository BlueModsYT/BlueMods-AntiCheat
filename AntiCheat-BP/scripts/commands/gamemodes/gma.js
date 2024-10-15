import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
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

Command.register({
    name: "gma",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!gma")) return;

    const targetName = args[0] || player.name; // Default to the command executor if no target name is provided
    const [targetPlayer] = world.getPlayers({ name: targetName });

    if (!targetPlayer) {
        player.runCommandAsync('playsound random.break @s');
        return player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
    }

    player.runCommandAsync(`playsound note.bell @s`);
    player.runCommandAsync(`gamemode a "${targetPlayer.name}"`);
    player.sendMessage(`§7[§a/§7] §e${targetPlayer.name} §aGamemode has been set to §6Adventure.`);

    // Notification for Admins:
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!gma §7/ gamemode adventure.`);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
});