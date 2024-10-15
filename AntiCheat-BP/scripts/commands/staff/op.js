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
    name: "op",
    description: "",
    aliases: [],
    permission: (player) => (player.hasTag(main.adminTag) || player.isOp())
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!op")) return;
    
    const action = args[0]?.toLowerCase(); // First argument: add, remove, or list
    const targetName = args[1] || player.name; // Second argument: target player's name, default to the command executor
    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const adminPlayers = world.getPlayers().filter(p => p.hasTag('admin')).map(p => p.name).join(', ');
        player.sendMessage(`§7[§b#§7] §aAdmins: §e${adminPlayers || 'No admins found'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!op §aadd ${main.player} §7/ §3!op §cremove ${main.player} §7/ §3!op §alist`);
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
            if (!targetPlayer.hasTag("admin")) {
                await system.run(() => targetPlayer.addTag("admin"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §3added §aadmin status to §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} already has admin status.`);
            }
        } else if (action === "remove") {
            if (targetPlayer.hasTag("admin")) {
                await system.run(() => targetPlayer.removeTag("admin"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §aadmin status from §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have admin status.`);
            }
        }
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError modifying player tags: ${error.message}`);
    }
});
