import { world, system, GameMode } from "@minecraft/server";
import main from "../commands/config.js";

// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

function getGamemode(player) {
    return Object.values(GameMode).find(
        (g) => [...world.getPlayers({ name: player.name, gameMode: g })].length
    );
}

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const gamemode = getGamemode(player);

        if (gamemode === 'creative') {
            if (player.hasTag(main.adminTag) || player.hasTag('trusted') || player.isOp()) continue;
            player.runCommandAsync('gamemode s @s');
            player.sendMessage('§bBlueMods §7>> §aYou need the appropriate permissions or tags to use creative mode. Please type !help to see the list of commands.');
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use gamemode creative.`);
                admin.runCommandAsync(`playsound random.break @s`);
            });
        }
    }
}, 4);
