import { world, system } from "@minecraft/server";
import { Command } from "../../systems/handler/CommandHandler.js";
import main from "../config.js";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

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

Command.register({
    name: "floatingtext",
    description: "",
    aliases: ["ft"],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!floatingtext")) return;
    
    const fullArgs = data.message.split(" ");
    if (fullArgs.length < 2) {
        player.sendMessage("§7[§b#§7] §cInvalid action! §aUse this method§7: §3!floatingtext §7<§atext§7> §7[§gx, y, z§7]");
        system.run(() => player.runCommand('playsound random.break @s'));
        return;
    }
    
    if (!data.message.includes("\"")) {
        player.sendMessage("§7[§b#§7] §cError: Text must be enclosed in quotation marks (\")");
        player.sendMessage("§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!floatingtext \"Your text here\" §7[§gx, y, z§7]");
        system.run(() => player.runCommand('playsound random.break @s'));
        return;
    }
    
    const textMatch = data.message.match(/"([^"]*)"/);
    if (!textMatch) {
        player.sendMessage("§7[§a-§7] §cError: Could not parse text. Make sure to use proper quotation marks");
        system.run(() => player.runCommand('playsound random.break @s'));
        return;
    }
    
    let text = textMatch[1];
    text = text.replace(/\\n/g, '\n');
    
    const remainingArgs = data.message.slice(textMatch.index + textMatch[0].length).trim().split(" ").filter(arg => arg);
    
    let x = "~";
    let y = "~1";
    let z = "~";
    
    if (remainingArgs.length >= 3) {
        x = remainingArgs[0];
        y = remainingArgs[1];
        z = remainingArgs[2];
    }
    
    try {
        system.run(() => {
            player.runCommand(`summon bluemods:floating_text ${x}${y}${z} ~~ minecraft:become_neutral "${text}"`);
        });
        player.sendMessage(`§7[§b#§7] §aAdded floating text at ${x} ${y} ${z}`);
    } catch (e) {
        player.sendMessage("§7[§c#§7] §cFailed to create floating text. Please check your coordinates.");
        console.warn(`Floating text summon failed: ${e}`);
    }
});