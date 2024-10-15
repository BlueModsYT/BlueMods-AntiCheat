import { Command } from "../CommandHandler.js";
import { world, system } from "@minecraft/server";
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

const playerRequest = {};
const cooldowns = {};
const tpablocks = {};
const COOLDOWN_TIME = 10000;
const TELEPORT_COUNTDOWN = 5;

Command.register({
    name: "tpa",
    description: "",
    aliases: [],
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!tpa")) return;
    
    const { id, name } = player;
    const send = "send", accept = 'accept', decline = 'decline', block = 'block', unblock = 'unblock', cancel = 'cancel';

    if (send.includes(args[0])) {
        const currentTime = Date.now();
        if (cooldowns[id] && currentTime - cooldowns[id] < COOLDOWN_TIME) {
            const remainingTime = ((COOLDOWN_TIME - (currentTime - cooldowns[id])) / 1000).toFixed(1);
            player.sendMessage(`§7[§e?§7] §aPlease wait §e${remainingTime}s §abefore sending another request.`);
            return player.runCommandAsync(`playsound random.break @s`);
        }

        cooldowns[id] = currentTime;

        const [foundPlayer] = world.getPlayers({ name: args[1] });
        if (!foundPlayer) {
            player.sendMessage(`§7[§b#§7] §cCan't find the player: §e${args[1]}`);
            return player.runCommandAsync(`playsound random.break @s`);
        }

        // Check if the found player has blocked this player
        if (tpablocks[foundPlayer.id] && tpablocks[foundPlayer.id].includes(id)) {
            player.sendMessage(`§7[§b#§7] §cYou are blocked from sending teleport requests to §e${foundPlayer.name}`);
            return player.runCommandAsync(`playsound random.break @s`);
        }

        if (foundPlayer == player) {
            player.sendMessage("§7[§b#§7] §cYou can't send a teleport request to yourself");
            return player.runCommandAsync(`playsound random.break @s`);
        }
        player.sendMessage(`§7[§b#§7] §aYou sent a teleport request to §e${foundPlayer.name}`);
        player.runCommandAsync(`playsound note.bell @s`);
        foundPlayer.sendMessage(`§7[§b#§7] §e${name} §asent you a teleport request§7: §3!tpa §aaccept.`);
        foundPlayer.runCommandAsync(`playsound random.orb @s`);

        playerRequest[foundPlayer.id] = { name, id };

    } else if (accept.includes(args[0])) {
        if (!playerRequest.hasOwnProperty(id)) {
            player.sendMessage('§7[§b#§7] §aYou don\'t have any teleport requests');
            return player.runCommandAsync(`playsound random.break @s`);
        }
        const { id: requesterId, name: requesterName } = playerRequest[id];
        const requester = world.getAllPlayers().find(({ id }) => id === requesterId);
        if (!requester) {
            player.sendMessage(`§7[§b#§7] §cCan't find the player: ${requesterName}`);
            return player.runCommandAsync(`playsound random.break @s`);
        }
        requester.sendMessage(`§7[§b#§7] §e${name}§a has accepted your teleport request`);
        player.sendMessage(`§7[§b#§7] §aTeleporting §e${requesterName} §ain §e${TELEPORT_COUNTDOWN} §aseconds...`);

        let countdown = TELEPORT_COUNTDOWN;
        const countdownInterval = system.runInterval(() => {
            if (countdown > 0) {
                requester.sendMessage(`§7[§b#§7] §aTeleporting in §e${countdown} §aseconds...`);
                player.sendMessage(`§7[§b#§7] §aTeleporting §e${requesterName} §ain §e${countdown} §aseconds...`);
                requester.runCommandAsync(`playsound random.orb @s`);
                countdown--;
            } else {
                system.clearRun(countdownInterval);
                requester.runCommandAsync(`tp "${requesterName}" "${player.name}"`);
                requester.sendMessage(`§7[§b#§7] §aYou have been teleported to §e${player.name}§a.`);
                player.runCommandAsync(`playsound random.levelup @s`);
                requester.runCommandAsync(`playsound random.levelup @s`);
                
                player.runCommandAsync(`effect @s weakness 15 255 true`);
                requester.runCommandAsync(`effect @s weakness 15 255 true`);
                player.runCommandAsync(`effect @s resistance 15 255 true`);
                requester.runCommandAsync(`effect @s resistance 15 255 true`);

                delete playerRequest[id];
            }
        }, 20);

    } else if (decline.includes(args[0])) {
        if (!playerRequest.hasOwnProperty(id)) {
            player.sendMessage('§7[§b#§7] §aThere are no teleport requests to decline');
            return player.runCommandAsync(`playsound random.break @s`);
        }
        const { id: requesterId, name: requesterName } = playerRequest[id];
        const requester = world.getAllPlayers().find(({ id }) => id === requesterId);
        if (!requester) {
            player.sendMessage(`§7[§b#§7] §cCan't find the player: §e${requesterName}`);
            return;
        }
        requester.sendMessage(`§7[§b#§7] §e${player.name} §chas declined your teleport request`);
        requester.runCommandAsync(`playsound random.break @s`);
        player.sendMessage(`§7[§b#§7] §aYou have declined ${requesterName}§a's request`);
        delete playerRequest[id];

    } else if (block.includes(args[0])) {
        const blockedPlayerName = args[1];
        if (!blockedPlayerName) {
            player.sendMessage('§7[§b#§7] §cPlease specify a player to block.');
            return player.runCommandAsync('playsound random.break @s');
        }

        const blockedPlayer = world.getPlayers().find(p => p.name === blockedPlayerName);

        if (!blockedPlayer) {
            player.sendMessage(`§7[§b#§7] §cPlayer §e${blockedPlayerName} §cnot found.`);
            return player.runCommandAsync('playsound random.break @s');
        }

        if (!tpablocks[id]) {
            tpablocks[id] = [];
        }
        if (!tpablocks[id].includes(blockedPlayer.id)) {
            tpablocks[id].push(blockedPlayer.id);
            player.sendMessage(`§7[§b#§7] §aYou have blocked teleport requests from §e${blockedPlayer.name}§a.`);
            player.runCommandAsync('playsound note.bell @s');
        } else {
            player.sendMessage(`§7[§b#§7] §e${blockedPlayer.name} §cis already blocked from sending requests.`);
        }

    } else if (unblock.includes(args[0])) {
        const unblockedPlayerName = args[1];
        if (!unblockedPlayerName) {
            player.sendMessage('§7[§b#§7] §cPlease specify a player to unblock.');
            return player.runCommandAsync('playsound random.break @s');
        }

        const unblockedPlayer = world.getPlayers().find(p => p.name === unblockedPlayerName);

        if (!unblockedPlayer) {
            player.sendMessage(`§7[§b#§7] §cPlayer §e${unblockedPlayerName} §cnot found.`);
            return player.runCommandAsync('playsound random.break @s');
        }

        if (tpablocks[id] && tpablocks[id].includes(unblockedPlayer.id)) {
            tpablocks[id] = tpablocks[id].filter(blockedId => blockedId !== unblockedPlayer.id);
            player.sendMessage(`§7[§b#§7] §aYou have unblocked teleport requests from §e${unblockedPlayer.name}§a.`);
            player.runCommandAsync('playsound note.bell @s');
        } else {
            player.sendMessage(`§7[§b#§7] §e${unblockedPlayer.name} §cis not blocked.`);
        }

    } else if (cancel.includes(args[0])) {
        if (!playerRequest[id]) {
            player.sendMessage('§7[§b#§7] §aYou don\'t have any active teleport request to cancel.');
            return player.runCommandAsync(`playsound random.break @s`);
        }
        
        const { id: targetId, name: targetName } = playerRequest[id];
        const targetPlayer = world.getAllPlayers().find(({ id }) => id === targetId);
        
        if (targetPlayer) {
            targetPlayer.sendMessage(`§7[§b#§7] §e${player.name} §chas canceled the teleport request.`);
            player.sendMessage(`§7[§b#§7] §aYou have canceled the teleport request to §e${targetName}.`);
            delete playerRequest[id];
        } else {
            player.sendMessage('§7[§b#§7] §aThe player you sent the teleport request to is no longer available.');
            delete playerRequest[id];
        }

        player.runCommandAsync(`playsound random.break @s`);
    } else {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!tpa §asend ${main.player} / §3!tpa §aaccept §7/ §3!tpa §cdecline §7/ §3!tpa §ccancel §7/ §3!tpa §eblock ${main.player} / §3!tpa §aunblock ${main.player}`);
        return player.runCommandAsync(`playsound random.break @s`);
    }
});
