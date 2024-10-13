import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

const AFK_THRESHOLD = 1000;
const CHECK_INTERVAL = 20;
const WARN_TIME = 30;
const adminTag = main.adminTag;

let playerActivity = new Map();

function trackPlayerMovement() {
    world.getPlayers().forEach(player => {
        if (player.hasTag(adminTag)) return;

        const playerName = player.name;
        const currentPos = player.location;

        let activity = playerActivity.get(playerName) || { lastPos: null, afkTime: 0, warned: false };
        const lastPos = activity.lastPos;

        if (lastPos && (currentPos.x !== lastPos.x || currentPos.y !== lastPos.y || currentPos.z !== lastPos.z)) {
            activity.afkTime = 0;
            activity.warned = false;
        } else {
            activity.afkTime += CHECK_INTERVAL;

            if (!activity.warned && activity.afkTime >= AFK_THRESHOLD - WARN_TIME) {
                player.sendMessage(`§7[§c!§7] §cYou will be kicked for AFK in ${WARN_TIME} seconds!`);
                activity.warned = true;
            } else if (activity.afkTime >= AFK_THRESHOLD) {
                player.runCommandAsync(`kick "${playerName}" You have been kicked for being AFK for too long.`);
            }
        }

        activity.lastPos = currentPos;
        playerActivity.set(playerName, activity);
    });

    system.runTimeout(trackPlayerMovement, CHECK_INTERVAL * 20);
}

system.run(trackPlayerMovement);

world.afterEvents.playerLeave.subscribe(event => {
    const { playerName } = event;
    playerActivity.delete(playerName);
});
