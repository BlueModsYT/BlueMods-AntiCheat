import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// all rights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const adminTag = main.adminTag;
const MAX_COORD = 30000000;
const CHECK_INTERVAL = 1; // ticks

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (player.hasTag(adminTag)) continue;

        const { x, y, z } = player.location;
        
        if (Math.abs(x) > MAX_COORD || 
            Math.abs(y) > MAX_COORD || 
            Math.abs(z) > MAX_COORD) {
            
            // Teleport back to spawn before kicking
            try {
                player.teleport({ x: 0, y: 64, z: 0 });
            } catch (error) {
                console.warn(`Failed to teleport player ${player.name}: ${error}`);
            }

            player.runCommandAsync(
                `kick "${player.name}" \n§bBlueMods §7>> §aYou have been kicked out from the server.\n§eReason§7: §cIllegal Position Detected.`
            );

            // Notify admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§d#§7] §e${player.name} §ahas been kicked out for illegal position (${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)})`);
                admin.runCommandAsync(`playsound random.break @s`);
            });
        }
    }
}, CHECK_INTERVAL);
