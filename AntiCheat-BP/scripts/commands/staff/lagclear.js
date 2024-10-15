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
    name: "lagclear",
    description: "",
    aliases: ["lc"],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!lagclear")) return;
    
    const action = args[0]?.toLowerCase();
    
    if (!["default", "mobs", "all"].includes(action)) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!lagclear §adefault §7/ §3!lagclear §amobs §7/ §3!lagclear §aall');
        player.runCommandAsync('playsound random.break @s');
        return;
    }
    
    if (action === "default") {
        player.runCommandAsync(`kill @e[type=item]`);
        player.runCommandAsync(`kill @e[type=arrow]`);
        player.runCommandAsync(`kill @e[type=xp_orb]`);
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccesfully use Default§7: §aItem Entities, XP Orbs, Arrows.`);
    } else if (action === "mobs") {
        player.runCommandAsync(`kill @e[type=!player, type=!armor_stand]`);
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully use Mobs§7: §aMob Entities.`);
    } else if (action === "all") {
        player.runCommandAsync(`kill @e[type=!player]`);
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully use All§7: §aAll Mob Entities.`);
    }
}); 
