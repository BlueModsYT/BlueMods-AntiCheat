import { world, system, GameMode } from "@minecraft/server";
import main from "../commands/config.js";

const checkInterval = 15;
const cooldownTime = 3;
const maxWarnings = 3;

const lastCheckTime = new Map();
const phaseWarnings = new Map();

function getGamemode(player) {
    return Object.values(GameMode).find(
        (g) => [...world.getPlayers({ name: player.name, gameMode: g })].length
    );
}

function isPlayerInsideBlock(player) {
    if (player.hasTag(main.adminTag)) return false;
    if (['creative', 'spectator'].includes(getGamemode(player))) return false; 
    const pos = player.location;
    const block = world.getDimension("overworld").getBlock(pos);

    return block && !block.isAir && block.isSolid;
}

function warnAndHandlePlayer(player) {
    const playerName = player.name;
    let currentWarnings = (phaseWarnings.get(playerName) || 0) + 1;
    phaseWarnings.set(playerName, currentWarnings);

    if (currentWarnings >= maxWarnings) {
        world.getDimension("overworld").runCommandAsync(`kick "${playerName}" §bBlueMods §7> §cPlease refrain from using Noclip or Phase.`);
        phaseWarnings.delete(playerName);
    } else {
        const pos = player.location;
        const safePosition = { x: pos.x, y: pos.y + 2, z: pos.z };
        player.teleport(safePosition, player.dimension);
        player.sendMessage(`§7[§b#§7] §cPhasing detected. Warning: ${currentWarnings}/${maxWarnings}.`);
        player.runCommandAsync(`playsound random.break @s`);
    }
}

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const currentTime = Date.now();
        const lastTime = lastCheckTime.get(player.name) || 0;

        if (currentTime - lastTime >= cooldownTime * 1000) {
            if (isPlayerInsideBlock(player)) {
                warnAndHandlePlayer(player);
            }
            lastCheckTime.set(player.name, currentTime);
        }
    }
}, checkInterval);
