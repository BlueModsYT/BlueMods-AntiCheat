import { world, system } from "@minecraft/server";
import { Command } from "../commands/CommandHandler.js";
import { badWords } from "./config.js";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. | Please report any bugs or glitches in our discord server https://dsc.gg/bluemods

const CHAT_CONFIG_STATES_KEY = "chatConfigStatesKey";

const lastMessages = new Map();
const messageCooldown = new Map();

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

// Anti Duplicate Text & Chat Ranks
function getChatFormat() {
    const format = world.getDynamicProperty(`globalChatFormat`);
    return format || "§l§7<§r{rank}§l§7>§r§7 {name} §l§b»§r §f{message}";
}

function setChatFormat(format) {
    world.setDynamicProperty(`globalChatFormat`, format);
}

function removeChatFormat() {
    world.setDynamicProperty(`globalChatFormat`, null);
}

function containsBadWords(message) {
    const lowerCaseMessage = message.toLowerCase();
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
    return regex.test(lowerCaseMessage);
}

function handleBadWords(player, message) {
    if (player.hasTag(main.adminTag)) return;

    if (containsBadWords(message)) {
        player.sendMessage(`§7[§b#§7] §cPlease refrain from using inappropriate language.`);
        player.runCommandAsync(`playsound random.break @s`);
        return true;
    }

    return false; 
}

function handleDuplicateMessage(player, message) {
    if (player.hasTag(main.adminTag)) return;

    const playerName = player.name;
    const normalizedMessage = message.trim().toLowerCase(); // Normalize message
    const lastMessage = lastMessages.get(playerName);

    if (lastMessage === normalizedMessage) {
        player.sendMessage("§7[§b#§7] §cPlease avoid sending duplicate messages.");
        player.runCommandAsync("playsound random.break @s");
        return true;
    }

    lastMessages.set(playerName, normalizedMessage);
    return false;
}

function isSpam(player) {
    if (player.hasTag(main.adminTag)) return;

    const playerName = player.name;
    const lastTimeSent = messageCooldown.get(playerName) || 0;
    const currentTime = Date.now();

    if (currentTime - lastTimeSent < main.chatConfig.SPAM_COOLDOWN_TIME) {
        player.sendMessage("§7[§b#§7] §cYou are sending messages too quickly! Please wait.");
        player.runCommandAsync("playsound random.break @s");
        return true;
    }

    messageCooldown.set(playerName, currentTime);
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

    if ((main.chatConfig.allowBadWords ? false : handleBadWords(player, message)) || (main.chatConfig.allowDuplicateMessages ? false : handleDuplicateMessage(player, message)) || (main.chatConfig.allowSpam ? false : isSpam(player))) {
        data.cancel = true;
        return;
    }

    if(debug_sticks_format_version != null){
        data.cancel = false;
        return;
    }
    console.log(debug_sticks_format_version)

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

system.run(() => {
    try {
        const storedStates = world.getDynamicProperty(CHAT_CONFIG_STATES_KEY);
        if (storedStates) {
            main.chatConfig = JSON.parse(storedStates);
        } else {
            world.setDynamicProperty(CHAT_CONFIG_STATES_KEY, JSON.stringify(main.chatConfig));
        }
    } catch (error) {
        console.error(`Error parsing stored chat config states: ${error.message}`);
    }
});

function saveChatConfigStates() {
    world.setDynamicProperty(CHAT_CONFIG_STATES_KEY, JSON.stringify(main.chatConfig));
}

Command.register({
    name: "chatconfig",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    const action = args[0]?.toLowerCase();
    const moduleName = args[1]?.toLowerCase();
    const integerValue = args[2]?.toLowerCase();

    if (!action || !["enable", "disable", "list", "set"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse: §3!chatconfig enable/disable <chatConfigOption> §7or §3!chatconfig list §7or §3!chatconfig set <chatConfigOption> <integerValue>`);
        return;
    }

    if (action === "set" && isNaN(integerValue)) {
        player.sendMessage(`§7[§b#§7] §c!Invalid integer value provided! §aUse: §3!chatconfig enable/disable <chatConfigOption> §7or §3!chatconfig list §7or §3!chatconfig set <chatConfigOption> <integerValue>`);
        return;
    }


    if (action === "list") {
        let moduleList = "§7[§b#§7] §aModule States:\n";
        let count = 1;
        for (const [key, state] of Object.entries(main.chatConfig)) {
            moduleList += `§7[§e${count}§7] §7[${typeof state == "boolean" ? state ? "§aENABLED" : "§cDISABLED" : state}§7] §e${key}\n`;
            count++;
        }
        player.sendMessage(moduleList);
        return;
    }

    const availableModules = Object.keys(main.chatConfig);
    if (!availableModules.map((key) => key.toLowerCase()).includes(moduleName)) {
        player.sendMessage(`§7[§b#§7] §cInvalid chat configuration option name. Available chat configuration options: ${availableModules.join(", ")}`);
        return;
    }

    if (action === "enable") {
        const actualModuleName = availableModules.find((key) => key.toLowerCase() === moduleName);
        if (main.chatConfig[actualModuleName]) {
            player.sendMessage(`§7[§b#§7] §cChat configuration option §e${actualModuleName} §cis already enabled.`);
        } else {
            main.chatConfig[actualModuleName] = true;
            saveChatConfigStates();
            player.sendMessage(`§7[§b#§7] §aChat configuration option §e${actualModuleName} §ahas been enabled.`);
        }
    } else if (action === "disable") {
        const actualModuleName = availableModules.find((key) => key.toLowerCase() === moduleName);
        if (!main.chatConfig[actualModuleName]) {
            player.sendMessage(`§7[§b#§7] §cChat configuration option §e${actualModuleName} §cis already disabled.`);
        } else {
            main.chatConfig[actualModuleName] = false;
            saveChatConfigStates();
            player.sendMessage(`§7[§b#§7] §aChat configuration option §e${actualModuleName} §ahas been disabled.`);
        }
    } else if (action === "set") {
        const actualModuleName = availableModules.find((key) => key.toLowerCase() === moduleName);
        if (main.chatConfig[actualModuleName] == Number(args[2])) {
            player.sendMessage(`§7[§b#§7] §cChat configuration option §e${actualModuleName} §cis already set to ${args[2]}.`);
        } else {
            main.chatConfig[actualModuleName] = false;
            saveChatConfigStates();
            player.sendMessage(`§7[§b#§7] §aChat configuration option §e${actualModuleName} §ahas been set to ${args[2]}.`);
        }
    }
});

system.runInterval(() => {
    world.getDimension("overworld").runCommandAsync(`scoreboard players reset @a Sents`);
}, 6000);

world.beforeEvents.chatSend.subscribe((data) => {
    if(debugSticksHasDisabledChatModification === true){
        return;
    }
    const chatDisplayEnabled = world.getDynamicProperty("chatDisplayEnabled");
    if (chatDisplayEnabled !== false && !data.message.startsWith(main.prefix)) {
        chat(data);
    }
});
