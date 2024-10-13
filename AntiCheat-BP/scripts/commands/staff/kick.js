import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. | please report any bugs or glitches in our discord server https://dsc.gg/bluemods

Command.register({
    name: "kick",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;

    if (args.length < 2) {
        player.sendMessage('§7[§b#§7] §aUse this method to kick the user§7: §3!kick §a<player> <reason>');
        return player.runCommandAsync('playsound random.break @s');
    }

    const targetPlayerName = args[0];
    const reason = args.slice(1).join(" ");

    let targetPlayer;
    try {
        targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);
    } catch (error) {
        return player.sendMessage(`§7[§b#§7] §aError finding player: ${error.message}`);
    }
    
    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer name must be someone currently on the server');
        return player.runCommandAsync('playsound random.break @s');
    }
    
    if (targetPlayer === player) {
        player.sendMessage('§7[§b#§7] §cYou cannot kick yourself.');
        return player.runCommandAsync('playsound random.break @s');
    }
    if (targetPlayer.hasTag(main.adminTag)) {
        player.sendMessage('§7[§b#§7] §cYou can\'t kick a staff member.');
        return player.runCommandAsync('playsound random.break @s');
    }
    
    try {
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully kicked out §e${targetPlayer.name} §afrom the server for§7: §g${reason}`);
        player.runCommandAsync(`kick "${targetPlayer.name}" "\n§bBlueMods §7>> §aYou have been kicked from the server\n§eModerator§7: §g${player.name}\n§eReason§7: §g${reason}"`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!kick §ato §e${targetPlayer.name} §aReason§7: §e${reason}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §aError executing kick: ${error.message}`);
    }
});
