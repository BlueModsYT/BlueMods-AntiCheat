import { world, system } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. | Please report any bugs or glitches in our discord server https://dsc.gg/bluemods

Command.register({
    name: "ecwipe",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, async (data, args) => {
    const player = data.player;
    if (!args[0]) {
        player.sendMessage('§7[§b#§7] §aTry to mention a player to remove there ender_chest. !ecwipe <player>');
        return player.runCommandAsync('playsound random.break @s');
    }

    let targetPlayer;
    try {
        targetPlayer = world.getPlayers().find(p => p.name === args[0]);
    } catch (error) {
        return player.sendMessage(`§7[§b#§7] §aError finding player: ${error.message}`);
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer name must be someone currently on the server');
        return player.runCommandAsync('playsound random.break @s');
    }

    if (targetPlayer === player) {
         player.sendMessage('§7[§b#§7] §cYou cannot clear your own ender_chest.');
         return player.runCommandAsync('playsound random.break @s');
    }
     if (targetPlayer.hasTag(main.adminTag)) {
         player.sendMessage('§7[§b#§7] §cYou can\'t clear a staff member ender_chest.');
         return player.runCommandAsync('playsound random.break @s');
    }

    try {
        player.runCommandAsync(`playsound note.bell @s`)
        player.sendMessage(`§7[§b#§7] §aSuccessfully §cremove ender_chest items on §e${targetPlayer.name}.`);
        for (let i = 0; i < 27; i++) player.runCommandAsync(`replaceitem entity "${targetPlayer.name}" slot.enderchest ${i} air`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!ecwipe to ${targetPlayer.name}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §aError adding notify tag: ${error.message}`);
    }
});