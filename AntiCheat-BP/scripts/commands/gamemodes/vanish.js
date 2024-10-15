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
    name: "vanish",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!vanish")) return;
    
    const targetName = args[0] || player.name; // Default to the command executor if no target name is provided
    const [targetPlayer] = world.getPlayers({ name: targetName });

    if (!targetPlayer) {
        player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
        return player.runCommandAsync('playsound random.break @s');
    }

    if (!targetPlayer.hasTag("vanish")) {
        player.runCommandAsync(`playsound note.bell @s`);
        player.runCommandAsync(`tag "${targetPlayer.name}" add vanish`);
        player.runCommandAsync(`effect "${targetPlayer.name}" invisibility 9999999 255 true`);
        player.runCommandAsync(`effect "${targetPlayer.name}" resistance 999999 255 true`);
        player.sendMessage(`§7[§a/§7] §aSuccessfully §3added §avanish to §e${targetPlayer.name}`);
        
        // Notification for Admins:
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!vanish add`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } else {
        player.runCommandAsync(`playsound note.bell @s`);
        player.runCommandAsync(`effect "${targetPlayer.name}" clear`);
        player.runCommandAsync(`tag "${targetPlayer.name}" remove vanish`);
        player.sendMessage(`§7[§a/§7] §aSuccessfully §cremoved §avanish from §e${targetPlayer.name}`);

        // Notification for Admins:
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!vanish remove`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    }
});
