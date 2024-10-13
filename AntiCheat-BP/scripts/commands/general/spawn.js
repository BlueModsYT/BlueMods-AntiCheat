import { Command } from "../CommandHandler.js";
import { world, system } from "@minecraft/server";
import main from "../config.js";

// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

let SPAWN_LOCATION = world.getDynamicProperty("spawnLocation") || null;

const TELEPORT_COOLDOWN = 5000; // (5 seconds)
const teleportingPlayers = new Map();

function saveSpawnLocation(location) {
    world.setDynamicProperty("spawnLocation", JSON.stringify(location));
}

function loadSpawnLocation() {
    const locationData = world.getDynamicProperty("spawnLocation");
    return locationData ? JSON.parse(locationData) : null;
}

SPAWN_LOCATION = loadSpawnLocation();

Command.register({
    name: "spawn",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    const { id } = player;

    if (!SPAWN_LOCATION) {
        player.sendMessage('§7[§c-§7] §cSpawn location has not been set by an admin.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already teleporting to spawn. Please wait.');
        return;
    }

    const initialPosition = player?.location ? { x: player.location.x, y: player.location.y, z: player.location.z } : null;
    if (!initialPosition) {
        player.sendMessage('§7[§c-§7] §cError: Unable to determine your position. Teleportation failed.');
        return;
    }

    player.sendMessage('§7[§a/§7] §aTeleporting to spawn in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: 5 });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = player.location ? { x: player.location.x, y: player.location.y, z: player.location.z } : null;

        if (!currentPosition) {
            player.sendMessage('§7[§c-§7] §cError: Unable to determine your position. Teleportation failed.');
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation to spawn canceled because you moved.');
            player.runCommandAsync('playsound random.break @s');
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to spawn in §e${playerData.countdown} seconds§a...`);
            player.runCommandAsync('playsound random.orb @s');
        } else {
            player.runCommandAsync(`execute in overworld run tp @s ${SPAWN_LOCATION.x} ${SPAWN_LOCATION.y} ${SPAWN_LOCATION.z}`)
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been teleported to spawn.');
                    player.runCommandAsync('playsound random.levelup @s');
                    // Notification for Admins
                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!spawn `);
                        admin.runCommandAsync(`playsound note.pling @s`);
                    });
                })
                .catch(error => {
                    player.sendMessage('§7[§c-§7] §cError: Teleportation failed. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });

            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
        }
    }, 20);
});

Command.register({
    name: "setspawn",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const { player } = data;

    if (SPAWN_LOCATION) {
        player.sendMessage('§7[§c-§7] §cSpawn location is already set. Use §3!rspawn §cto remove it before setting a new one.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    SPAWN_LOCATION = {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z
    };

    saveSpawnLocation(SPAWN_LOCATION);

    player.sendMessage(`§7[§a/§7] §aSpawn location set to your current position: §e${SPAWN_LOCATION.x} ${SPAWN_LOCATION.y} ${SPAWN_LOCATION.z}`);
    player.runCommandAsync(`playsound random.levelup @s`);
    // Notification for Admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!setspawn `);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
});

Command.register({
    name: "rspawn",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const { player } = data;

    if (!SPAWN_LOCATION) {
        player.sendMessage('§7[§c-§7] §cThere is no spawn location set to remove.');
        return;
    }

    SPAWN_LOCATION = null;

    world.removeDynamicProperty("spawnLocation");

    player.sendMessage('§7[§a/§7] §aThe spawn location has been removed.');
    player.runCommandAsync(`playsound random.break @s`);
    // Notification for Admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!rspawn`);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
});
