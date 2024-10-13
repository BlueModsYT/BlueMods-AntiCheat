import { world, system } from "@minecraft/server";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods.

const validNameRegex = /^[a-zA-Z0-9_ ]+$/;

const checkForNameSpoof = (player) => {
    const playerName = player.name.trim();

    if (playerName === "" || playerName.length < 3 || playerName.length > 16) {
        return true;
    }

    if (!validNameRegex.test(playerName)) {
        return true;
    }

    return false;
};

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (checkForNameSpoof(player)) {
        player.runCommandAsync('kick @s §cInvalid or spoofed name detected. check your username if its valid.');
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§d#§7] §e${player.name} §ahas been kicked out for using an invalid username.`);
            admin.runCommandAsync(`playsound random.break @s`);
        });
    }
});
