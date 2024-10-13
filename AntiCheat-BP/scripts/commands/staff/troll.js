import { Command } from "../CommandHandler.js";
import { world } from "@minecraft/server";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

const cooldowns = {};

Command.register({
    name: "troll",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    const { id, name } = player;
    const trollTypes = ["creeper", "endermen", "ghast", "zombie", "skeleton"];
    const COOLDOWN_TIME = 10000;

    const currentTime = Date.now();
    if (cooldowns[id] && currentTime - cooldowns[id] < COOLDOWN_TIME) {
        const remainingTime = ((COOLDOWN_TIME - (currentTime - cooldowns[id])) / 1000).toFixed(1);
        player.sendMessage(`§7[§b#§7] §aPlease wait §e${remainingTime}s §abefore using the troll command again.`);
        return player.runCommandAsync('playsound random.break @s');
    }

    if (args.length < 2) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: !troll <troll> <player>');
        player.sendMessage('§7[§b#§7] §aTroll list §7(§ecreeper§7/§eendermen§7/§eghast§7/§ezombie§7/§eskeleton§7)');
        return player.runCommandAsync('playsound random.break @s');
    }

    const trollType = args[0];
    const targetPlayerName = args[1];

    if (!trollTypes.includes(trollType)) {
        player.sendMessage('§7[§b#§7] §aInvalid troll type. You have to choose one of these §7(§ecreeper§7/§eendermen§7/§eghast§7/§ezombie§7/§eskeleton§7)');
        return player.runCommandAsync('playsound random.break @s');
    }

    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);
    if (!targetPlayer) {
        player.sendMessage(`§7[§b#§7] §cCan\'t find the player§7: §e${targetPlayerName}`);
        return player.runCommandAsync('playsound random.break @s');
    }

    switch (trollType) {
        case "creeper":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a creeper troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound random.fuse "${targetPlayerName}"`);
            break;
        case "endermen":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent an endermen troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.endermen.scream "${targetPlayerName}"`);
            break;
        case "ghast":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a ghast troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.ghast.scream "${targetPlayerName}"`);
            break;
        case "zombie":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a zombie troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.zombie.say "${targetPlayerName}"`);
            break;
        case "skeleton":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a skeleton troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.skeleton.say "${targetPlayerName}"`);
            break;
    }

    cooldowns[id] = currentTime;
});
