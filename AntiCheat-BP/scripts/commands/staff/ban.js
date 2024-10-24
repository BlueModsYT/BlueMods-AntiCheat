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
    const currentTime = Date.now();
    const bannedPlayer = bannedPlayers.find(player => player.name === playerName);
    if (bannedPlayer && bannedPlayer.expiration && bannedPlayer.expiration < currentTime) {
        unbanPlayer(playerName);
        return false;
    }
    return !!bannedPlayer;
}

function parseCustomDuration(durationStr) {
    const timeUnits = {
        "m": 60000,           // minutes to milliseconds
        "h": 3600000,         // hours to milliseconds
        "d": 86400000,        // days to milliseconds
        "w": 604800000,       // weeks to milliseconds
    };

    const match = durationStr.match(/^(\d+)([mhdw])$/); // Match the format: number + unit (m, h, d, w)
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        return value * timeUnits[unit];
    } else {
        return null;
    }
}

function banPlayer(targetName, reason, moderator, durationStr = null) {
    if (isPlayerBanned(targetName)) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis already banned.`);
        return;
    }

    let expiration = null;
    if (durationStr) {
        const durationInMs = parseCustomDuration(durationStr);
        if (durationInMs) {
            expiration = Date.now() + durationInMs;
        } else {
            moderator.sendMessage("§7[§b#§7] §cInvalid duration format. Use: 1m, 1h, 1d, etc.");
            return;
        }
    }

    bannedPlayers.push({ name: targetName, reason, moderator: moderator.name, expiration });
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        targetPlayer.addTag("ban");
        let message = `kick "${targetName}" §bBlueMods §7>> You have been banned from the server.\n§eReason§7: §c${reason}`;
        if (expiration) {
            const expirationDate = new Date(expiration);
            message += `\n§eBan Duration§7: §cUntil ${expirationDate.toLocaleString()}`;
        } else {
            message += `\n§eBan Duration§7: §cPermanent`;
        }
        targetPlayer.runCommandAsync(message);
    }

    moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been banned for §c${reason}§a by §e${moderator.name}.`);
    moderator.runCommandAsync('playsound random.levelup @s');
}

function unbanPlayer(targetName, player = null) {
    const bannedIndex = bannedPlayers.findIndex(p => p.name === targetName);

    if (bannedIndex === -1) {
        if (player) {
            player.sendMessage(`§7[§b#§7] §e${targetName} §cis not banned.`);
        }
        return;
    }

    bannedPlayers.splice(bannedIndex, 1);
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        targetPlayer.removeTag("ban");
    }

    if (player) {
        player.sendMessage(`§7[§b#§7] §e${targetName} §ahas been unbanned.`);
        player.runCommandAsync('playsound random.levelup @s');
    }
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
    const durationOrTarget = args[1];
    const targetName = args[2];
    const reason = args.slice(3).join(" ") || "No reason specified";

    if (!["add", "list", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this method§7: §3!ban §aadd §7[§aduration§7] ${main.player} <§areason§7> §7/ §3!ban §cremove ${main.player} §7/ §3!ban §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (action === "add") {
        if (targetName === player.name || player.hasTag(main.adminTag)) {
            player.sendMessage(`§7[§b#§7] §cYou cannot ban yourself or another admin.`);
            return;
        }

        const durationInMs = parseCustomDuration(durationOrTarget);
        if (durationInMs) {
            banPlayer(targetName, reason, player, durationOrTarget);
        } else {
            banPlayer(durationOrTarget, reason, player); // No duration, permanent ban
        }

        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ahas banned §e${targetName} §aReason§7: §e${reason}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } 
    else if (action === "list") {
        if (bannedPlayers.length === 0) {
            player.sendMessage('§7[§b#§7] §cNo players are currently banned.');
        } else {
            const banList = bannedPlayers.map(p => {
                let expirationText = p.expiration ? `Until ${new Date(p.expiration).toLocaleString()}` : "Permanent";
                return `§e${p.moderator} §7[§gMOD§7] §7| §e${p.name} §aReason§7: ${p.reason} §7(§c${expirationText}§7)`;
            }).join("\n");
            player.sendMessage(`§7[§b#§7] §aBanned Players:\n${banList}`);
        }

    } 
    else if (action === "remove") {
        unbanPlayer(durationOrTarget, player);
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
    const { player } = event;
    if (isPlayerBanned(player.name)) {
        const bannedPlayer = bannedPlayers.find(p => p.name === player.name);
        let message = `kick "${player.name}" §bBlueMods §7>> You are banned from the server.\n§eReason§7: §c${bannedPlayer.reason}`;
        if (bannedPlayer.expiration) {
            const timeRemaining = Math.ceil((bannedPlayer.expiration - Date.now()) / 60000);
            message += `\n§eTime Left§7: §c${timeRemaining} minutes`;
        } else {
            message += `\n§eBan Duration§7: §cPermanent`;
        }
        player.runCommandAsync(message);
    }
});
