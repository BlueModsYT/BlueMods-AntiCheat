import { world, system } from "@minecraft/server";
import main from "../commands/config.js";
import spawnManager from "../handlings/SpawnHandler.js";

//░███░░██░░██░░█░████░██░░██░░████░░████░░░███░
//░█░░█░█░░░░█░░█░█░░░░██░░██░█░░░█░░█░░░█░█░░█░
//░███░░█░░░░█░░█░███░░██░░██░█░░░░█░█░░░█░██░░░
//░█░░█░█░░░░█░░█░█░░░░█░██░█░█░░░░█░█░░░█░░░█░░
//░█░░█░█░░█░█░░█░█░░█░█░██░█░█░░░█░░█░░░█░█░░█░
//░███░░████░███░░████░█░█░░█░░███░░░████░░███░░
// https://dsc.gg/bluemods

const adminTag = main.adminTag;
const MAX_COORD = 30_000_000;
const CHECK_INTERVAL = 1;

/**
 * Checks a player for an illegal position.
 *
 * @param {Player} player
 */
function checkIllegalPosition(player) {
    if (player.hasTag(adminTag)) return;

    const { x, y, z } = player.location;

    if (Math.abs(x) > MAX_COORD || Math.abs(y) > MAX_COORD || Math.abs(z) > MAX_COORD) {
        try {
            const spawnLocation = spawnManager.getSpawnLocation();

            if (spawnLocation) {
                system.run(() => player.runCommand(`tp @s ${spawnLocation.x} ${spawnLocation.y} ${spawnLocation.z}`));
            } else {
                console.warn(`Failed to teleport player ${player.name}: Spawn location is not defined.`);
            }
        } catch (error) {
            console.warn(`Failed to teleport player ${player.name}: ${error}`);
        }

        system.run(()=>player.runCommand(
            `kick "${player.name}" \n§bBlueMods §7> §aYou have been kicked out from the server.\n§eReason§7: §cIllegal Position Detected.`
        ));

        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§d#§7] §e${player.name} §ahas been kicked for illegal position (${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)})`);
            system.run(() => admin.runCommand(`playsound random.break @s`));
        });
    }
}

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        checkIllegalPosition(player);
    }
}, CHECK_INTERVAL);
