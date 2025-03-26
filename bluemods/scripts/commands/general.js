import { world, system } from "@minecraft/server";
import { Command } from "../systems/handler/CommandHandler.js";
import { sendTeleportRequest, acceptTeleportRequest, declineTeleportRequest, blockPlayer, unblockPlayer } from "../systems/handler/TeleportHandler.js";
import main from "./config.js";

// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

function isCommandEnabled(commandName) {
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;
}

const isAuthorized = (player, commandName) => {
    if (!isCommandEnabled(commandName)) {
        player.sendMessage(`§7[§b#§7] §cThis command §e${commandName} §cis currently disabled.`);
        system.run(() => player.runCommand(`playsound random.break @s`));
        return false;
    }
    return true;
};

const teleportingPlayers = new Map();
const HOME_DYNAMIC_PROPERTY = "playerHome";
const MAX_HOME_SLOTS = 5;
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
    
    system.run(() => data.player.runCommand(`playsound note.bell @s`))
    data.player.sendMessage(`
    §l§bBlueMods §cAnti§fCheat §r
${main.bmdescription}

§7> §aMC Supported§7: ${main.mcversion}
§7> §aAddon Version§7: ${main.bmversion}
${debug_sticks_format_version !== null ? "§7> §aConnected Version of 8Crafter's Debug Sticks Add-On§7: " + debug_sticks_format_version : ""}

${main.developer}

§aDevelopers§7:
§a${main.bluemods.join("§7, §a")}`)
    // Notification for Admins:
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!about`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
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
            system.run(() => player.runCommand('playsound random.break @s'));
    }
});

export function setHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify a home name.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    let homes = homeDataJson ? JSON.parse(homeDataJson) : {};

    if (Object.keys(homes).length >= MAX_HOME_SLOTS) {
        player.sendMessage(`§7[§c-§7] §cYou can only set up to ${MAX_HOME_SLOTS} homes. Use §3!home remove <home_name> §cto remove an existing home.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    homes[homeName] = {
        location: player.location,
        dimension: player.dimension.id
    };

    player.setDynamicProperty(HOME_DYNAMIC_PROPERTY, JSON.stringify(homes));

    player.sendMessage(`§7[§a/§7] §aHome §e${homeName} §aset successfully!`);
    system.run(() => player.runCommand(`playsound note.bell @s`));
}

export function teleportHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the home name you want to teleport to.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    const homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set. Use §3!home set <home_name> §cto create one.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    const homes = JSON.parse(homeDataJson);

    if (!homes[homeName]) {
        player.sendMessage(`§7[§c-§7] §cHome §e${homeName} §cdoes not exist. Check your home name.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
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
            system.run(() => player.runCommand('playsound random.break @s'));
            teleportingPlayers.delete(player.id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to your home in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);

            const { x, y, z } = home.location;
            const dimension = home.dimension === "minecraft:overworld" ? "overworld" :
                              home.dimension === "minecraft:nether" ? "nether" : "the_end";
            
            system.run(() => player.runCommand(`execute in ${dimension} run tp @s ${x} ${y} ${z}`))
                .then(() => {
                    player.sendMessage(`§7[§a/§7] §aTeleported to your home §e${homeName}§a.`);
                    system.run(() => player.runCommand(`playsound random.levelup @s`));
                })
                .catch((error) => {
                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport to your home. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });

            teleportingPlayers.delete(player.id);
        }
    }, 20);
}

export function removeHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the home name you want to remove.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homes = JSON.parse(homeDataJson);

    if (!homes[homeName]) {
        player.sendMessage(`§7[§c-§7] §cHome §e${homeName} §cdoes not exist.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    delete homes[homeName];

    player.setDynamicProperty(HOME_DYNAMIC_PROPERTY, JSON.stringify(homes));

    player.sendMessage(`§7[§a/§7] §aHome §e${homeName} §ahas been removed.`);
    system.run(() => player.runCommand(`playsound note.bell @s`));
}

export function listHomes(player) {
    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homes = JSON.parse(homeDataJson);
    const homeList = Object.keys(homes);

    if (homeList.length === 0) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    player.sendMessage(`§7[§a/§7] §aYour saved homes: §e${homeList.join(', ')}`);
    system.run(() => player.runCommand(`playsound random.levelup @s`));
}

Command.register({
    name: "ping",
    description: "",
    aliases: [],
}, async (data) => {
    const { player } = data;
    const start = Date.now();

    await system.run(() => player.runCommand(`testfor @s`));

    const responseTime = Date.now() - start;
    
    let pingStatus = "§aLow";
    if (responseTime > 100) {
        pingStatus = "§cHigh";
    } else if (responseTime > 50) {
        pingStatus = "§gMedium";
    }

    const worldTPS = Math.min(20, 20);
    player.sendMessage(`§7[§a#§7] §aPing§7: §e${responseTime}ms §7[${pingStatus}§7] | §aTPS: §e${worldTPS}§7/§e20`);

    system.run(() => player.runCommand(`playsound random.orb @s`));
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
            system.run(() => player.runCommand('playsound random.break @s'));
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aRandom teleporting in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);
            system.run(() => player.runCommand(`/effect @s resistance 25 255 true`));

            system.run(() => player.runCommand(`/spreadplayers ~ ~ 500 1000 @s`))
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been randomly teleported.');
                    system.run(() => player.runCommand(`playsound random.levelup @s`));
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

    if (!args[0]) {
        player.sendMessage("§7[§b#§7] §cInvalid usage! Use §3!tpa send <player> / !tpa accept / !tpa decline / !tpa block <player> / !tpa unblock <player>.");
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    switch (args[0].toLowerCase()) {
        case "send":
            const target = world.getPlayers().find(p => p.name === args[1]);
            if (!target) return player.sendMessage(`§7[§b#§7] §cPlayer not found.`);
            sendTeleportRequest(player, target);
            break;
        case "accept":
            acceptTeleportRequest(player);
            break;
        case "decline":
            declineTeleportRequest(player);
            break;
        case "block":
            if (!args[1]) return player.sendMessage("§7[§b#§7] §cSpecify a player to block.");
            const blockTarget = world.getPlayers().find(p => p.name === args[1]);
            if (!blockTarget) return player.sendMessage(`§7[§b#§7] §cPlayer not found.`);
            blockPlayer(player, blockTarget);
            break;
        case "unblock":
            if (!args[1]) return player.sendMessage("§7[§b#§7] §cSpecify a player to unblock.");
            const unblockTarget = world.getPlayers().find(p => p.name === args[1]);
            if (!unblockTarget) return player.sendMessage(`§7[§b#§7] §cPlayer not found.`);
            unblockPlayer(player, unblockTarget);
            break;
        default:
            player.sendMessage("§7[§b#§7] §cInvalid usage! Use §3!tpa send <player> / !tpa accept / !tpa decline / !tpa block <player> / !tpa unblock <player>.");
            system.run(() => player.runCommand(`playsound random.break @s`));
    }
});