import { world } from "@minecraft/server";
import { Command } from "../../systems/handler/CommandHandler.js";
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

const deathLocations = new Map();

world.afterEvents.entityDie.subscribe((event) => {
    const { deadEntity } = event;

    if (deadEntity && deadEntity.typeId === "minecraft:player") {
        const playerName = deadEntity.name;
        const { x, y, z } = deadEntity.location;
        const dimensionId = deadEntity.dimension.id.replace("minecraft:", "");

        deathLocations.set(playerName, { x, y, z, dimensionId });
    }
});

Command.register({
    name: "back",
    description: "Teleports you to your last death location.",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "!back")) return;

    const playerName = player.name;

    if (!deathLocations.has(playerName)) {
        player.sendMessage("§7[§b#§7] §cYou haven't died recently or your death location is unavailable.");
        return;
    }

    const { x, y, z, dimensionId } = deathLocations.get(playerName);
    const currentDimension = player.dimension.id.replace("minecraft:", "");

    if (x === player.location.x && y === player.location.y && z === player.location.z && dimensionId === currentDimension) {
        player.sendMessage("§7[§b#§7] §cYou are already at your death location.");
        return;
    }

    let executeCommand = `execute in ${dimensionId} run tp @s ${x} ${y} ${z}`;

    player.runCommandAsync(executeCommand).then(() => {
        player.sendMessage("§7[§b#§7] §aYou have been teleported back to your death location.");
        deathLocations.delete(playerName);
    }).catch(() => {
        player.sendMessage("§7[§b#§7] §cTeleportation failed. Invalid dimension.");
    });
});