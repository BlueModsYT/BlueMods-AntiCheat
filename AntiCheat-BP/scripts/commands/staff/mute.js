import { world, system } from "@minecraft/server";
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
    name: "mute",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag)
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!mute")) return;
    
    const action = args[0]?.toLowerCase();
    const targetName = args[1] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const mutedPlayers = world.getPlayers().filter(p => p.hasTag('muted')).map(p => p.name).join('§7,§r ');
        player.sendMessage(`§7[§b#§7] §aMuted: §e${mutedPlayers || 'No muted player found'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!mute §aadd ${main.player} §7/ §3!mute §cremove ${main.player} §7/ §3!mute §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer not found! Please specify a valid player name.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    try {
        if (action === "add") {
            if (targetPlayer.hasTag(main.adminTag) || targetPlayer.name === player.name) {
                player.sendMessage(`§7[§b#§7] §cYou cannot mute yourself or admin.`);
                return;
            }
            
            if (!targetPlayer.hasTag("muted")) {
                await system.run(() => targetPlayer.addTag("muted"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.runCommandAsync(`ability "${targetPlayer.name}" mute true`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §3added §amute status to §e${targetPlayer.name}`);
                
                // Notification for Admins
                world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                    admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!mute add §ato §e${targetPlayer.name}`);
                    admin.runCommandAsync(`playsound note.pling @s`);
                });
            } else {
                player.runCommandAsync('playsound random.break @s');
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} this player is already muted`);
            }
        } else if (action === "remove") {
            if (targetPlayer.hasTag("muted")) {
                await system.run(() => targetPlayer.removeTag("muted"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.runCommandAsync(`ability "${targetPlayer.name}" mute false`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §amute status from §e${targetPlayer.name}`);
                
                // Notification for Admins
                world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                    admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!mute remove §ato §e${targetPlayer.name}`);
                    admin.runCommandAsync(`playsound note.pling @s`);
                });
            } else {
                player.runCommandAsync('playsound random.break @s');
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} this player is not muted.`);
            }
        }
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError modifying player tags: ${error.message}`);
    }
});
