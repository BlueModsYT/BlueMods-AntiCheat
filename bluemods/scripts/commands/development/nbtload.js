import { world, system } from '@minecraft/server';
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

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
    name: "nbtload",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const player = data.player;
    if (!isAuthorized(player, "!nbtload")) return;
    
    player.runCommandAsync(`structure load blue_nbteverything ~~~`);
    player.runCommandAsync(`playsound random.levelup @s`);
});