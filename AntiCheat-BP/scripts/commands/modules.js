import { world } from "@minecraft/server";
import { Command } from "./CommandHandler.js";
import main from "./config.js";

const enabledCommands = {
    general: { ...main.general },
    staff: { ...main.staff },
    gamemodes: { ...main.gamemodes }
};

Command.register({
    name: "module",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.sender;

    if (args.length < 2) {
        player.sendMessage("§cInvalid usage. Correct usage: !module <enable/disable> <command>");
        return;
    }

    const action = args[0].toLowerCase();
    const commandName = args[1]?.toLowerCase();

    if (!["enable", "disable"].includes(action) || !commandName) {
        player.sendMessage("§cInvalid usage. Correct usage: !module <enable/disable> <command>");
        return;
    }

    let found = false;
    for (const category of Object.keys(enabledCommands)) {
        if (commandName in enabledCommands[category]) {
            enabledCommands[category][commandName] = action === "enable";
            player.sendMessage(`§aCommand '${commandName}' has been ${action}d.`);
            found = true;
            break;
        }
    }

    if (!found) {
        player.sendMessage(`§cCommand '${commandName}' not found.`);
    }
});

Command.register({
    name: "modules",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const player = data.sender;

    let moduleList = "§6Modules Status:\n";
    for (const [category, commands] of Object.entries(enabledCommands)) {
        moduleList += `\n§b${category}:\n`;
        for (const [command, status] of Object.entries(commands)) {
            moduleList += `§7${command} - ${status ? "§aEnabled" : "§cDisabled"}\n`;
        }
    }
    player.sendMessage(moduleList);
});
