import { world, system } from "@minecraft/server";
import { Command } from "../../systems/handler/CommandHandler.js";
import { showCompassUI } from "../../chat/playerCompass.js";
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
    name: "compass",
    description: "",
    aliases: [],
}, (data) => {
    const player = data.player;
    if (!isAuthorized(player, "!compass")) return;

    const inventory = player.getComponent("inventory")?.container;
    if (!inventory) return;

    let hasCompass = false;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === "bluemods:itemui") {
            hasCompass = true;
            break;
        }
    }

    if (!hasCompass) {
        player.runCommandAsync('give @s bluemods:itemui');
        player.sendMessage("§7[§b#§7] §aYou received a compass!");
    } else {
        player.sendMessage("§7[§b#§7] §cYou already have a compass in your inventory.");
        player.runCommandAsync('playsound random.break @s');
    }

    player.runCommandAsync('playsound note.pling @s');
});

world.afterEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const message = event.message.trim();

    if (message === "") {
        showCompassUI(player);
    }
});