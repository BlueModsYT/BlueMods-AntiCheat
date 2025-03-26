import { world, system } from "@minecraft/server";
import { Command } from "../../systems/handler/CommandHandler.js";
import spawnManager from "../../systems/handler/SpawnHandler.js";
import main from "../config.js";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

const TELEPORT_COUNTDOWN = 5;
const teleportingPlayers = new Map();

Command.register({
    name: "spawn",
    description: "Teleport to the spawn location.",
    aliases: [],
}, (data) => {
    const { player } = data;
    const { id } = player;
    const SPAWN_LOCATION = spawnManager.getSpawnLocation();

    if (!SPAWN_LOCATION) {
        player.sendMessage('§7[§c-§7] §cSpawn location has not been set by an admin.');
        system.run(() => player.runCommand('playsound random.break @s'));
        return;
    }

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already teleporting to spawn. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aTeleporting to spawn in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: TELEPORT_COUNTDOWN });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            teleportingPlayers.delete(id);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation to spawn canceled because you moved.');
            system.run(() => player.runCommand('playsound random.break @s'));
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to spawn in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);
            teleportingPlayers.delete(id);

            system.run(() => player.runCommand(`tp @s ${SPAWN_LOCATION.x} ${SPAWN_LOCATION.y} ${SPAWN_LOCATION.z}`))
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been teleported to spawn.');
                    system.run(() => player.runCommand('playsound random.levelup @s'));
                    // Notification for Admins
                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!spawn `);
                        system.run(() => admin.runCommand(`playsound note.pling @s`));
                    });
                })
                .catch(error => {
                    player.sendMessage('§7[§c-§7] §cError: Teleportation failed. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });
        }
    }, 20);
});

Command.register({
    name: "setspawn",
    description: "Set the spawn location.",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const { player } = data;

    const location = {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z
    };

    spawnManager.setSpawnLocation(location);

    player.sendMessage(`§7[§a/§7] §aSpawn location set to your current position: §e${location.x} ${location.y} ${location.z}`);
    system.run(() => player.runCommand(`playsound random.levelup @s`));
    // Notification for Admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!setspawn `);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

Command.register({
    name: "rspawn",
    description: "Remove the spawn location.",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const { player } = data;

    spawnManager.clearSpawnLocation();

    player.sendMessage('§7[§a/§7] §aThe spawn location has been removed.');
    system.run(() => player.runCommand(`playsound random.break @s`));
    // Notification for Admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!rspawn`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});