import { world, system } from "@minecraft/server";
import { Command } from "../commands/CommandHandler.js"; // Import Command system
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

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

let messages = new Map();
let spamTimers = new Map();
const spamCooldown = 3; // 3 seconds cooldown
const maxMessages = 3; // Maximum messages allowed within the cooldown period
const playerSpamData = new Map();

function getChatFormat(player) {
    const format = world.getDynamicProperty(`chatFormat_${player.name}`);
    return format || "§7[{rank}§7] {name}: §f{message}";
}

function setChatFormat(player, format) {
    world.setDynamicProperty(`chatFormat_${player.name}`, format);
}

function removeChatFormat(player) {
    world.setDynamicProperty(`chatFormat_${player.name}`, null);
}

function chat(data) {
    const tags = data.sender.getTags();
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''));

    if (tags.includes('admin')) {
        ranks.push("§dAdmin");
    }
    if (tags.includes('trusted')) {
        ranks.push("§sTrusted");
    }

    ranks = ranks.length ? ranks : ["§6Member"];

    let score;
    try {
        score = world.scoreboard.getObjective('Sents').getScore(data.sender.scoreboard);
    } catch (e) {
        score = 0;
    }

    if (score >= 3) {
        data.cancel = true;
        return data.sender.sendMessage(`§7[§b#§7] §aYou're sending messages too quickly, slow down buddy.`);
    }

    const lastMessage = messages.get(data.sender.name);
    const currentTime = Date.now();

    if (lastMessage && lastMessage.message === data.message) {
        data.cancel = true;
        return data.sender.sendMessage(`§7[§b#§7] §aPlease do not type the same message.`);
    }

    messages.set(data.sender.name, { message: data.message, time: currentTime });

    const playerName = data.sender.name;
    const playerData = playerSpamData.get(playerName) || { lastMessageTime: 0, messageCount: 0 };

    const timeDiff = (currentTime - playerData.lastMessageTime) / 1000;

    if (timeDiff > spamCooldown) {
        playerData.messageCount = 0;
    }

    playerData.messageCount++;
    playerData.lastMessageTime = currentTime;

    if (playerData.messageCount > maxMessages) {
        data.cancel = true;
        const countdown = Math.ceil(spamCooldown - timeDiff);
        return data.sender.sendMessage(`§7[§b#§7] §cSlow down, you're flooding the chat. Wait ${countdown} second's.`);
    }

    playerSpamData.set(playerName, playerData);

    data.sender.runCommandAsync(`scoreboard players add @s Sents 1`);

    if (data.message.startsWith("!*")) {
        data.cancel = true;
        return;
    }

    const rankText = ranks.map(rank => `${rank}`).join(" §7|§f ");
    const format = getChatFormat(data.sender);
    const chatMessage = format
        .replace("{rank}", rankText)
        .replace("{name}", data.sender.nameTag)
        .replace("{message}", data.message);

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
        setChatFormat(player, format);
        player.sendMessage("§7[§b#§7] §aSuccessfully Updated Chat format.");
        player.runCommandAsync(`playsound note.bell @s`);
    } else if (action === "remove") {
        removeChatFormat(player);
        player.sendMessage("§7[§b#§7] §aChat format has been reset to default.");
        player.runCommandAsync(`playsound note.bell @s`);
    } else {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!rankdisplay §7<§eset§7/§cremove§7> <§achatstyle§7>\n\n§aUsage of symbols: \n§e{name} §a= player's username\n§e{rank} §a= it is important to use this on custom\n§e{message} §a= don't forgot this to import the message's.`);
        player.runCommandAsync('playsound random.break @s');
    }
});

system.runInterval(() => {
    world.getDimension("overworld").runCommandAsync(`scoreboard players reset @a Sents`);
}, 6000);

world.beforeEvents.chatSend.subscribe((data) => {
    if (!data.message.startsWith(main.prefix)) {
        chat(data);
    }
});
