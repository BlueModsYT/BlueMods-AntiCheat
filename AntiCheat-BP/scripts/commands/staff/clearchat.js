import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

Command.register({
    name: "clearchat",
    description: "",
    aliases: ["cc"],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const player = data.player;
    
    player.sendMessage(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`);
    player.runCommandAsync(`playsound note.bell @s`);
});
