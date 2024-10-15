import { world, system } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

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

const BANNED_PLAYERS_KEY = "bannedPlayers";
let bannedPlayers = [];

system.run(() => {
    const storedBannedPlayers = world.getDynamicProperty(BANNED_PLAYERS_KEY);
    if (!storedBannedPlayers) {
        world.setDynamicProperty(BANNED_PLAYERS_KEY, JSON.stringify(bannedPlayers));
    } else {
        bannedPlayers = JSON.parse(storedBannedPlayers);
    }
});

function saveBannedPlayers() {
    world.setDynamicProperty(BANNED_PLAYERS_KEY, JSON.stringify(bannedPlayers));
}

function isPlayerBanned(playerName) {
    return bannedPlayers.some(player => player.name === playerName);
}

function banPlayer(targetName, reason, moderator) {
    if (isPlayerBanned(targetName)) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis already banned.`);
        return;
    }

    bannedPlayers.push({ name: targetName, reason, moderator: moderator.name });
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        targetPlayer.addTag("ban");
        targetPlayer.runCommandAsync(`kick "${targetName}" §bBlueMods §7>> You have been banned from the server.\n§eReason§7: §c${reason}`);
    }

    moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been banned for §c${reason}§a by §e${moderator.name}.`);
    moderator.runCommandAsync('playsound random.levelup @s');
}

function unbanPlayer(targetName, player) {
    const bannedIndex = bannedPlayers.findIndex(p => p.name === targetName);

    if (bannedIndex === -1) {
        player.sendMessage(`§7[§b#§7] §e${targetName} §cis not banned.`);
        return;
    }

    bannedPlayers.splice(bannedIndex, 1);
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        targetPlayer.removeTag("ban");
    }

    player.sendMessage(`§7[§b#§7] §e${targetName} §ahas been unbanned.`);
    player.runCommandAsync('playsound random.levelup @s');
}

Command.register({
    name: "ban",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!ban")) return;
    
    const action = args[0]?.toLowerCase();
    const targetName = args[1];
    const reason = args.slice(2).join(" ") || "No reason specified";

    if (!["add", "list", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this method§7: §3!ban §aadd ${main.player} ${main.reason} §7/ §3!ban §cremove ${main.player} §7/ §3!ban §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (action === "add") {
        if (targetName === player.name || player.hasTag(main.adminTag)) {
            player.sendMessage(`§7[§b#§7] §cYou cannot ban yourself or another admin.`);
            return;
        }

        banPlayer(targetName, reason, player);
        
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ahas banned §e${targetName} §aReason§7: §e${reason}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } 
    else if (action === "list") {
        if (bannedPlayers.length === 0) {
            player.sendMessage('§7[§b#§7] §cNo players are currently banned.');
        } else {
            const banList = bannedPlayers.map(p => `§e${p.moderator} §7[§gMOD§7] §7| §e${p.name} §aReason§7: ${p.reason}`).join("\n");
            player.sendMessage(`§7[§b#§7] §aBanned Players:\n${banList}`);
        }

    } 
    else if (action === "remove") {
        unbanPlayer(targetName, player);
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
    const { player } = event;
    if (isPlayerBanned(player.name)) {
        const bannedPlayer = bannedPlayers.find(p => p.name === player.name);
        player.runCommandAsync(`kick "${player.name}" §bBlueMods §7>> You are banned from the server.\n§eReason§7: §c${bannedPlayer.reason}`);
    }
});
