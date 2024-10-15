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
    name: "about",
    description: "",
    aliases: []
}, (data) => {
    const player = data.player
    if (!isAuthorized(player, "!about")) return;
    
    data.player.runCommandAsync(`playsound note.bell @s`)
    data.player.sendMessage(`
    §l§bBlueMods §cAnti§fCheat §r
${main.bmdescription}

§7> §aMC Supported: ${main.mcversion}
§7> §aAddon Version§7: ${main.bmversion}

${main.developer}`)
    // Notification for Admins:
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!about`);
        admin.runCommandAsync(`playsound note.pling @s`);
    });
});