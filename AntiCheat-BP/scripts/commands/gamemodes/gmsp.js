import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

Command.register({
    name: "gmsp",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    const targetName = args[0] || player.name; // Default to the command executor if no target name is provided
    const [targetPlayer] = world.getPlayers({ name: targetName });

    if (!targetPlayer) {
        player.runCommandAsync('playsound random.break @s');
        return player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
    }

    player.runCommandAsync(`playsound note.bell @s`);
    player.runCommandAsync(`gamemode spectator "${targetPlayer.name}"`);
    player.sendMessage(`§7[§a/§7] §e${targetPlayer.name} §aGamemode has been set to §6Spectator.`);

    // Notification for Admins:
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!gmsp §7/ gamemode spectator.`);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
});
