import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

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

Command.register({
    name: "cmdsf",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player
    if (!isAuthorized(player, "!cmdsf")) return;
    
    const enable = "enable", disable = "disable";
    
    if (disable.includes(args[0])) { 
        player.runCommandAsync(`playsound note.bell @s`);
        player.runCommandAsync('gamerule commandblockoutput false');
        player.runCommandAsync('gamerule sendcommandfeedback false');
        player.sendMessage(`§7[§b#§7] §aSuccesfully §cdisabled §aCommand Logs`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!cmdsf disable`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } else if (enable.includes(args[0])) {
        player.runCommandAsync(`playsound note.bell @s`);
        player.runCommandAsync('gamerule commandblockoutput true');
        player.runCommandAsync('gamerule sendcommandfeedback true');
        player.sendMessage(`§7[§b#§7] §aSuccesfully §3enabled §aCommand Logs`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!cmdsf enable`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } else {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!cmdsf ${main.enabledisable}`);
        player.runCommandAsync(`playsound random.break @s`);
    }
}); 

