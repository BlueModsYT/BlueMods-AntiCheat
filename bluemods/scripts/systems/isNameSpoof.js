import { world, system } from "@minecraft/server";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods.

const validNameRegex = /^([\p{L}])([\p{L}\d\s#'()-_]{1,20})([\p{L}\d\)])$/isu;

const checkForNameSpoof = (player) => {
    const playerName = player.name.trim();

    if (playerName === "" || playerName.length < 3 || playerName.length > 16 || !validNameRegex.test(playerName)) {
        return true;
    }

    return false;
};

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (checkForNameSpoof(player)) {
        system.run(() => player.runCommand('kick @s §cInvalid or spoofed name detected. Check your username for validity.'));
        
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§d#§7] §e${player.name} §ahas been kicked out for using an invalid username.`);
            system.run(() => admin.runCommand(`playsound random.break @s`));
        });
    }
});