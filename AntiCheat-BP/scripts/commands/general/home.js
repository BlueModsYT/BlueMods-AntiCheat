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

const HOME_DYNAMIC_PROPERTY = "playerHome";
const MAX_HOME_SLOTS = 2;
const teleportingPlayers = new Map();

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
