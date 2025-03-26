import { world, system } from "@minecraft/server";
import { Command } from "../../systems/handler/CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server https://dsc.gg/bluemods

function isCommandEnabled(commandName) {
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;
}

const isAuthorized = (player, commandName) => {
    if (!isCommandEnabled(commandName)) {
        player.sendMessage(`§7[§b#§7] §cThis command §e${commandName} §cis currently disabled.`);
        system.run(() => player.runCommand(`playsound random.break @s`));
        return false;
    }
    return true;
};

function displayCategory(player, categories, page) {
    const totalPages = categories.length;

    const adjustedPage = page - 1;

    if (adjustedPage < 0 || adjustedPage >= totalPages) {
        player.sendMessage("§7[§c-§7] §cInvalid page number.");
        system.run(() => player.runCommand(`playsound random.break @s`));
        return;
    }

    const category = categories[adjustedPage];
    player.sendMessage(`§l§b${category.name}§r`);
    category.commands.forEach(line => player.sendMessage(line));

    if (totalPages > 1) {
        player.sendMessage(`\n§7You're in Page: §a${page}§7/§a${totalPages} §7| Use §a!help <page> §7to view other categories.\n`);
    }
}

Command.register({
    name: "help",
    description: "",
    aliases: ["?"]
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!help")) return;

    const page = args[0] ? parseInt(args[0]) : 1;

    if (isNaN(page) || page < 1) {
        player.sendMessage("§7[§c-§7] §cInvalid page number. Please use a number greater than or equal to 1.");
        system.run(() => player.runCommand(`playsound random.break @s`));
        return;
    }

    if (player.hasTag("admin")) {
        displayCategory(player, main.adminCategories, page);
    } else {
        displayCategory(player, main.memberCategories, page);
    }

    // Notify admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help §afor ${player.hasTag("admin") ? "admins" : "members"}`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});