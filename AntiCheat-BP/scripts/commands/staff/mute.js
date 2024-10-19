import { Command } from "../CommandHandler.js";
import { world } from "@minecraft/server";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods.

const mutedPlayers = new Set();

function isAdmin(player) {
    return player.hasTag(main.adminTag);
}

function notifyAdmins(action, playerName, targetName) {
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${playerName} §ais using §3!mute ${action} §ato §e${targetName}`);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
}

function addMute(player, targetName) {
    if (mutedPlayers.has(targetName)) {
        player.sendMessage(`§7[§b#§7] §cPlayer §e${targetName} §cis already muted.`);
        return;
    }

    const target = world.getPlayers().find(p => p.name === targetName);
    if (!target || target.name === player.name) {
        player.sendMessage(`§7[§b#§7] §cYou cannot mute yourself.`);
        return;
    }
    if (!target || target.name === player.hasTag(main.adminTag)) {
        player.sendMessage(`§7[§b#§7] §cYou cannot mute an admin.`);
        return;
    }

    mutedPlayers.add(targetName);
    player.sendMessage(`§7[§b#§7] §aPlayer §e${targetName} §ahas been muted.`);
    target.sendMessage(`§7[§b#§7] §cYou have been muted by an admin.`);

    notifyAdmins("add", player.name, targetName);
}

function removeMute(player, targetName) {
    if (!mutedPlayers.has(targetName)) {
        player.sendMessage(`§7[§b#§7] §cPlayer §e${targetName} §cis not muted.`);
        return;
    }

    mutedPlayers.delete(targetName);
    player.sendMessage(`§7[§b#§7] §aPlayer §e${targetName} §ahas been unmuted.`);
    const target = world.getPlayers().find(p => p.name === targetName);
    if (target) {
        target.sendMessage(`§7[§b#§7] §aYou have been unmuted.`);
    }

    notifyAdmins("remove", player.name, targetName);
}

function listMutes(player) {
    if (mutedPlayers.size === 0) {
        player.sendMessage("§7[§b#§7] §aNo players are currently muted.");
        return;
    }

    const muteList = Array.from(mutedPlayers).join(", ");
    player.sendMessage(`§7[§b#§7] §aMuted players: §e${muteList}`);
}

Command.register({
    name: "mute",
    description: "Manage player mutes",
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;

    if (args.length < 2) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!mute ${main.addremove} ${main.player} §7/ §3!mute §alist`);
        return;
    }

    const action = args[0].toLowerCase(); 
    const targetName = args[1];

    if (action === "list") {
        listMutes(player);
        return;
    }

    if (!targetName) {
        player.sendMessage(`§7[§b#§7] §cUsage: §e!mute ${action} <player>`);
        return;
    }

    switch (action) {
        case "add":
            addMute(player, targetName);
            break;
        case "remove":
            removeMute(player, targetName);
            break;
        default:
            player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!mute ${main.addremove} ${main.player} §7/ §3!mute §alist`);
            break;
    }
});

world.beforeEvents.chatSend.subscribe((data) => {
    const { sender } = data;
    if (mutedPlayers.has(sender.name)) {
        data.cancel = true;
        sender.sendMessage("§7[§b#§7] §cYou are muted and cannot send messages.");
    }
});