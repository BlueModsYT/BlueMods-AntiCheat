import { world, system } from "@minecraft/server";
import { Command } from "./CommandHandler.js";
import main from "./config.js";

// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

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

const teleportingPlayers = new Map();
const HOME_DYNAMIC_PROPERTY = "playerHome";
const MAX_HOME_SLOTS = 2;
const TELEPORT_COOLDOWN = 5000; // (5 seconds)
const playerRequest = {};
const cooldowns = {};
const tpablocks = {};
const COOLDOWN_TIME = 10000;
const TELEPORT_COUNTDOWN = 5;

Command.register({
    name: "about",
    description: "",
    aliases: []
}, (data) => {
    const player = data.player
    if (!isAuthorized(player, "!about")) return;
    
    data.player.runCommandAsync(`playsound note.bell @s`)
    data.player.sendMessage(`
    §l§bBlueMods §cAnti§fCheat §r
${main.bmdescription}

§7> §aMC Supported: ${main.mcversion}
§7> §aAddon Version§7: ${main.bmversion}
${debug_sticks_format_version !== null ? "§7> §aConnected Version of 8Crafter's Debug Sticks Add-On§7: " + debug_sticks_format_version : ""}

${main.developer}`)
    // Notification for Admins:
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!about`);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
});

Command.register({
    name: "home",
    description: "Manages player homes",
    aliases: [],
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!home")) return;

    const action = args[0]?.toLowerCase(); // 'tp', 'set', 'remove', or 'list'
    const homeName = args[1] || "default"; // Default home name if not specified

    if (!action) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!home §7<§atp§7/§eset§7/§cremove§7> §7<§ehomeName§7>`);
        return;
    }

    switch (action) {
        case "tp":
            teleportHome(player, homeName);
            break;
        case "set":
            setHome(player, homeName);
            break;
        case "remove":
            removeHome(player, homeName);
            break;
        case "list":
            listHomes(player);
            break;
        default:
            player.sendMessage(`§7[§b#§7] §cUnknown action: §e${action}§c. Use §3!home <tp/set/remove/list>`);
            player.runCommandAsync('playsound random.break @s');
    }
});

function setHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify a home name.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    let homes = homeDataJson ? JSON.parse(homeDataJson) : {};

    if (Object.keys(homes).length >= MAX_HOME_SLOTS) {
        player.sendMessage(`§7[§c-§7] §cYou can only set up to ${MAX_HOME_SLOTS} homes. Use §3!home remove <home_name> §cto remove an existing home.`);
        return player.runCommandAsync(`playsound random.break @s`);
    }

    homes[homeName] = {
        location: player.location,
        dimension: player.dimension.id
    };

    player.setDynamicProperty(HOME_DYNAMIC_PROPERTY, JSON.stringify(homes));

    player.sendMessage(`§7[§a/§7] §aHome §e${homeName} §aset successfully!`);
    player.runCommandAsync(`playsound note.bell @s`);
}

function teleportHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the home name you want to teleport to.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    const homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set. Use §3!home set <home_name> §cto create one.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    const homes = JSON.parse(homeDataJson);

    if (!homes[homeName]) {
        player.sendMessage(`§7[§c-§7] §cHome §e${homeName} §cdoes not exist. Check your home name.`);
        return player.runCommandAsync(`playsound random.break @s`);
    }

    const home = homes[homeName];

    if (teleportingPlayers.has(player.id)) {
        player.sendMessage('§7[§c-§7] §cYou are already in the process of teleporting. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aTeleporting to your home in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(player.id, { initialPosition, countdown: 5 });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(player.id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation to home canceled because you moved.');
            player.runCommandAsync('playsound random.break @s');
            teleportingPlayers.delete(player.id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to your home in §e${playerData.countdown} seconds§a...`);
            player.runCommandAsync('playsound random.orb @s');
        } else {
            system.clearRun(countdownInterval);

            const { x, y, z } = home.location;
            const dimension = home.dimension === "minecraft:overworld" ? "overworld" :
                              home.dimension === "minecraft:nether" ? "nether" : "the_end";
            
            player.runCommandAsync(`execute in ${dimension} run tp @s ${x} ${y} ${z}`)
                .then(() => {
                    player.sendMessage(`§7[§a/§7] §aTeleported to your home §e${homeName}§a.`);
                    player.runCommandAsync(`playsound random.levelup @s`);
                })
                .catch((error) => {
                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport to your home. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });

            teleportingPlayers.delete(player.id);
        }
    }, 20);
}

function removeHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the home name you want to remove.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    let homes = JSON.parse(homeDataJson);

    if (!homes[homeName]) {
        player.sendMessage(`§7[§c-§7] §cHome §e${homeName} §cdoes not exist.`);
        return player.runCommandAsync(`playsound random.break @s`);
    }

    delete homes[homeName];

    player.setDynamicProperty(HOME_DYNAMIC_PROPERTY, JSON.stringify(homes));

    player.sendMessage(`§7[§a/§7] §aHome §e${homeName} §ahas been removed.`);
    player.runCommandAsync(`playsound note.bell @s`);
}

function listHomes(player) {
    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    let homes = JSON.parse(homeDataJson);
    const homeList = Object.keys(homes);

    if (homeList.length === 0) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return player.runCommandAsync(`playsound random.break @s`);
    }

    player.sendMessage(`§7[§a/§7] §aYour saved homes: §e${homeList.join(', ')}`);
    player.runCommandAsync(`playsound random.levelup @s`);
}

Command.register({
    name: "ping",
    description: "",
    aliases: [],
}, async (data) => {
    const { player } = data;
    const start = Date.now();

    await player.runCommandAsync(`testfor @s`);

    const responseTime = Date.now() - start;
    
    let pingStatus = "§aLow";
    if (responseTime > 100) {
        pingStatus = "§cHigh";
    } else if (responseTime > 50) {
        pingStatus = "§gMedium";
    }

    const worldTPS = Math.min(20, 20);
    player.sendMessage(`§7[§a#§7] §aPing§7: §e${responseTime}ms §7[${pingStatus}§7] | §aTPS: §e${worldTPS}§7/§e20`);

    player.runCommandAsync(`playsound random.orb @s`);
});

Command.register({
    name: "rtp",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "!rtp")) return;
    
    const { id } = player;

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already in the process of teleporting. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aRandom teleporting in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: 5 });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation canceled because you moved.');
            player.runCommandAsync('playsound random.break @s');
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aRandom teleporting in §e${playerData.countdown} seconds§a...`);
            player.runCommandAsync('playsound random.orb @s');
        } else {
            system.clearRun(countdownInterval);
            player.runCommandAsync(`/effect @s resistance 25 255 true`);

            player.runCommandAsync(`/spreadplayers ~ ~ 500 1000 @s`)
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been randomly teleported.');
                    player.runCommandAsync(`playsound random.levelup @s`);
                })
                .catch((error) => {
                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });

            teleportingPlayers.delete(id);
        }
    }, 20);
});

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
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!tpa §asend ${main.player} / §3