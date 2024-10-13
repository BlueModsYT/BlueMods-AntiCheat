import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

Command.register({
    name: "about",
    description: "",
    aliases: []
}, (data) => {
    const player = data.player
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