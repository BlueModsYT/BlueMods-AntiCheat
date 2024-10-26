import { world, system } from "@minecraft/server";
import { Command } from "../commands/CommandHandler.js";
import { badWords } from "./config.js";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. | Please report any bugs or glitches in our discord server https://dsc.gg/bluemods

const badWordCount = new Map();
const lastMessages = new Map();

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

// Anti Spam & Chat Ranks

function getChatFormat() {
    const format = world.getDynamicProperty(`globalChatFormat`);
    return format || "§7[{rank}§7] {name}: §f{message}";
}

function setChatFormat(format) {
    world.setDynamicProperty(`globalChatFormat`, format);
}

function removeChatFormat() {
    world.setDynamicProperty(`globalChatFormat`, null);
}

function containsBadWords(message) {
    const lowerCaseMessage = message.toLowerCase();
    return badWords.some(badWord => lowerCaseMessage.includes(badWord));
}

function handleBadWords(player, message) {
    const playerName = player.name;
    if (player.hasTag(main.adminTag)) return;

    if (containsBadWords(message)) {
        let count = badWordCount.get(playerName) || 0;
        count += 1;
        badWordCount.set(playerName, count);

        if (count >= 3) {
            world.getDimension('overworld').runCommandAsync(`kick "${playerName}" §bBlueMods §7> §cPlease refrain from using Inappropriate language`);
            badWordCount.delete(playerName);
        } else {
            player.sendMessage(`§7[§b#§7] §cPlease refrain from using inappropriate language. Warning: ${count}/3.`);
            player.runCommandAsync(`playsound random.break @s`);
        }
        return true;
    }

    return false; 
}

function handleDuplicateMessage(player, message) {
    const playerName = player.name;
    const lastMessage = lastMessages.get(playerName);

    if (lastMessage === message) {
        player.sendMessage("§7[§b#§7] §cPlease avoid sending duplicate messages.");
        player.runCommandAsync("playsound random.break @s");
        return true;
    }

    lastMessages.set(playerName, message);
    return false;
}

function formatChatMessage(player, message) {
    const tags = player.getTags();
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''));

    if (tags.includes('trusted')) {
        ranks.push("§sTrusted");
    }

    ranks = ranks.length ? ranks : ["§6Member"];
    const rankText = ranks.map(rank => `${rank}`).join(" §7|§f ");
    const format = getChatFormat();

    return format
        .replace("{rank}", rankText)
        .replace("{name}", player.nameTag)
        .replace("{message}", message);
}

function chat(data) {
    const player = data.sender;
    const message = data.message;

    if (handleBadWords(player, message) || handleDuplicateMessage(player, message)) {
        data.cancel = true;
        return;
    }

    const chatMessage = formatChatMessage(player, message);
    world.getDimension('overworld').runCommandAsync(`tellraw @a {"rawtext":[{"translate":${JSON.stringify(chatMessage)}}]}`);
    
    data.cancel = true;
}

Command.register({
    name: "chatdisplay",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!chatdisplay")) return;

    const action = args[0];
    const format = args.slice(1).join(" ");

    if (action === "set") {
        setChatFormat(format);
        player.sendMessage(`§7[§b#§7] §aSuccessfully updated chat format for everyone.`);
        player.runCommandAsync(`playsound note.bell @s`);
    } else if (action === "remove") {
        removeChatFormat();
        player.sendMessage(`§7[§b#§7] §aChat format has been reset to default for everyone.`);
        player.runCommandAsync(`playsound note.bell @s`);
    } else if (action === "enable") {
        world.setDynamicProperty("chatDisplayEnabled", true);
        player.sendMessage(`§7[§b#§7] §aSuccessfully Enabled Chat Display.`);
        player.runCommandAsync(`playsound note.bell @s`);
    } else if (action === "disable") {
        world.setDynamicProperty("chatDisplayEnabled", false);
        player.sendMessage(`§7[§b#§7] §aSuccessfully §cDisabled §aChat Display.`);
        player.runCommandAsync(`playsound note.bell @s`);
    } else {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse: §3!chatdisplay §7<§eset§7/§cremove§7> <§achatstyle§7>\n\n§aSymbols:\n§e{name} §a= player's username\n§e{rank} §a= rank\n§e{message} §a= message.`);
        player.runCommandAsync('playsound random.break @s');
    }
});

system.runInterval(() => {
    world.getDimension("overworld").runCommandAsync(`scoreboard players reset @a Sents`);
}, 6000);

world.beforeEvents.chatSend.subscribe((data) => {
    const chatDisplayEnabled = world.getDynamicProperty("chatDisplayEnabled");
    if (chatDisplayEnabled !== false && !data.message.startsWith(main.prefix)) {
        chat(data);
    }
});
