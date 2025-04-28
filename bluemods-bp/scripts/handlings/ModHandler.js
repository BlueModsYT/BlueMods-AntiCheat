import { world, system } from "@minecraft/server";

export const BANNED_PLAYERS_KEY = "bannedPlayers";
let bannedPlayers = [];

export function initializeBanSystem() {
    const storedBannedPlayers = world.getDynamicProperty(BANNED_PLAYERS_KEY);
    bannedPlayers = storedBannedPlayers ? JSON.parse(storedBannedPlayers) : [];
    if (!storedBannedPlayers) {
        saveBannedPlayers();
    }
    
    const currentTime = Date.now();
    bannedPlayers = bannedPlayers.filter(player => {
        if (player.expiration && player.expiration < currentTime) {
            return false;
        }
        return true;
    });
    saveBannedPlayers();
}

function saveBannedPlayers() {
    world.setDynamicProperty(BANNED_PLAYERS_KEY, JSON.stringify(bannedPlayers));
}

export function isPlayerBanned(playerName) {
    const currentTime = Date.now();
    const bannedPlayer = bannedPlayers.find(player => player.name === playerName);
    
    if (bannedPlayer && bannedPlayer.expiration && bannedPlayer.expiration < currentTime) {
        unbanPlayer(playerName);
        return false;
    }
    return !!bannedPlayer;
}

export function parseCustomDuration(durationStr) {
    if (!durationStr) return null;
    
    const timeUnits = {
        "m": 60000,           // minutes to milliseconds
        "h": 3600000,         // hours to milliseconds
        "d": 86400000,        // days to milliseconds
        "w": 604800000,       // weeks to milliseconds
    };

    const match = durationStr.match(/^(\d+)([mhdw])$/);
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        return value * timeUnits[unit];
    }
    return null;
}

export function banPlayer(targetName, reason, moderator, durationStr = null) {
    if (isPlayerBanned(targetName)) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis already banned.`);
        return false;
    }

    let expiration = null;
    if (durationStr) {
        const durationInMs = parseCustomDuration(durationStr);
        if (durationInMs) {
            expiration = Date.now() + durationInMs;
        } else {
            moderator.sendMessage("§7[§b#§7] §cInvalid duration format. Use: 1m, 1h, 1d, etc.");
            return false;
        }
    }

    bannedPlayers.push({ 
        name: targetName, 
        reason, 
        moderator: moderator.name, 
        expiration,
        date: new Date().toISOString()
    });
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        system.run(() => targetPlayer.runCommand(`tag "${targetName}" add ban`));
        let message = `kick "${targetName}" .\n§bBlueMods §7>> You have been banned from the server.\n§eReason§7: §c${reason}`;
        if (expiration) {
            const expirationDate = new Date(expiration);
            message += `\n§eBan Duration§7: §cUntil ${expirationDate.toLocaleString()}`;
        } else {
            message += `\n§eBan Duration§7: §cPermanent`;
        }
        system.run(() => targetPlayer.runCommand(message));
    }

    moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been banned for §c${reason}§a by §e${moderator.name}.`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
    return true;
}

export function unbanPlayer(targetName, moderator = null) {
    const bannedIndex = bannedPlayers.findIndex(p => p.name === targetName);

    if (bannedIndex === -1) {
        if (moderator) moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis not banned.`);
        return false;
    }

    bannedPlayers.splice(bannedIndex, 1);
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        system.run(() => targetPlayer.runCommand(`tag "${targetName}" remove ban`));
    }

    if (moderator) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been unbanned.`);
        system.run(() => moderator.runCommand('playsound random.levelup @s'));
    }
    return true;
}

export function getBannedPlayers() {
    return [...bannedPlayers];
}

initializeBanSystem();

// Mute System
const mutedPlayers = new Set();

export function mutePlayer(targetName, moderator) {
    if (mutedPlayers.has(targetName)) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis already muted.`);
        return;
    }

    mutedPlayers.add(targetName);
    moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been muted.`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

export function unmutePlayer(targetName, moderator) {
    if (!mutedPlayers.has(targetName)) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis not muted.`);
        return;
    }

    mutedPlayers.delete(targetName);
    moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been unmuted.`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

//
// Operator Panel
//

// Add Operator
export function operatorPlayer(targetName, moderator) {
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        moderator.sendMessage(`§7[§b#§7] §cPlayer not found.`);
        return;
    }

    if (targetPlayer.hasTag("admin")) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §chas already admin status.`);
        return;
    }

    targetPlayer.addTag("admin");
    moderator.sendMessage(`§7[§b#§7] §aSuccessfully §3added §aadmin status to §e${targetPlayer.name}`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

// Remove Operator
export function unoperatorPlayer(targetName, moderator) {
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        moderator.sendMessage(`§7[§b#§7] §cPlayer not found.`);
        return;
    }

    if (!targetPlayer.hasTag("admin")) {
        moderator.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have admin status.`);
        return;
    }

    targetPlayer.removeTag("admin");
    moderator.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §aadmin status from §e${targetPlayer.name}`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

// Add notify
export function notifyPlayer(targetName, moderator) {
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        moderator.sendMessage(`§7[§b#§7] §cPlayer not found.`);
        return;
    }

    if (targetPlayer.hasTag("notify")) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §chas already notify status.`);
        return;
    }

    targetPlayer.addTag("notify");
    moderator.sendMessage(`§7[§b#§7] §aSuccessfully §3added §anotify status to §e${targetPlayer.name}`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

// Remove Notify
export function unnotifyPlayer(targetName, moderator) {
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        moderator.sendMessage(`§7[§b#§7] §cPlayer not found.`);
        return;
    }

    if (!targetPlayer.hasTag("notify")) {
        moderator.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have notify status.`);
        return;
    }

    targetPlayer.removeTag("notify");
    moderator.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §anotify status from §e${targetPlayer.name}`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

// Add Trusted
export function trustedPlayer(targetName, moderator) {
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        moderator.sendMessage(`§7[§b#§7] §cPlayer not found.`);
        return;
    }

    if (targetPlayer.hasTag("trusted")) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §chas already trusted status.`);
        return;
    }

    targetPlayer.addTag("admin");
    moderator.sendMessage(`§7[§b#§7] §aSuccessfully §3added §atrusted status to §e${targetPlayer.name}`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}

// Remove Trusted
export function untrustedPlayer(targetName, moderator) {
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        moderator.sendMessage(`§7[§b#§7] §cPlayer not found.`);
        return;
    }

    if (!targetPlayer.hasTag("trusted")) {
        moderator.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have trusted status.`);
        return;
    }

    targetPlayer.removeTag("trusted");
    moderator.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §atrusted status from §e${targetPlayer.name}`);
    system.run(() => moderator.runCommand('playsound random.levelup @s'));
}