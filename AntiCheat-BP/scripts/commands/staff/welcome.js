import { world, system } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

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

const WELCOME_MESSAGE_KEY = "welcomeMessage";
const LEAVE_MESSAGE_KEY = "leaveMessage";
const defaultWelcomeMessage = `§bBlueMods §7>> §e{name}§a, Welcome Member.\n§cHacking on this server will result in an automatic ban!`;
const defaultLeaveMessage = `§bBlueMods §7>> §e{name} §chas left the server.`;

let welcomeMessage = defaultWelcomeMessage;
let leaveMessage = defaultLeaveMessage;

system.run(() => {
    const storedWelcomeMessage = world.getDynamicProperty(WELCOME_MESSAGE_KEY);
    const storedLeaveMessage = world.getDynamicProperty(LEAVE_MESSAGE_KEY);
    
    if (!storedWelcomeMessage) {
        world.setDynamicProperty(WELCOME_MESSAGE_KEY, defaultWelcomeMessage);
    } else {
        welcomeMessage = storedWelcomeMessage;
    }
    
    if (!storedLeaveMessage) {
        world.setDynamicProperty(LEAVE_MESSAGE_KEY, defaultLeaveMessage);
    } else {
        leaveMessage = storedLeaveMessage;
    }
});

function saveWelcomeMessage(message) {
    world.setDynamicProperty(WELCOME_MESSAGE_KEY, message);
}

function saveLeaveMessage(message) {
    world.setDynamicProperty(LEAVE_MESSAGE_KEY, message);
}

Command.register({
    name: "welcome",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!welcome")) return;
    
    const type = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();
    const customMessage = args.slice(2).join(" ");

    if (!["join", "leave"].includes(type) || !["set", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!welcome §7<§ajoin§7/§cleave§7> §7<§eset§7/§cremove§7> §7<§atext§7>`);
        return player.runCommandAsync('playsound random.break @s');
    }

    if (action === "set") {
        if (!customMessage) {
            player.sendMessage('§7[§b#§7] §cPlease provide a valid message.');
            return;
        }

        if (type === "join") {
            welcomeMessage = customMessage;
            saveWelcomeMessage(welcomeMessage);
            player.sendMessage(`§7[§b#§7] §aJoin message set to: §e${welcomeMessage}`);
        } else if (type === "leave") {
            leaveMessage = customMessage;
            saveLeaveMessage(leaveMessage);
            player.sendMessage(`§7[§b#§7] §aLeave message set to: §e${leaveMessage}`);
        }

        player.runCommandAsync('playsound random.levelup @s');
    } else if (action === "remove") {
        if (type === "join") {
            if (welcomeMessage === defaultWelcomeMessage) {
                player.sendMessage('§7[§b#§7] §cNo custom join message is set.');
            } else {
                welcomeMessage = defaultWelcomeMessage;
                saveWelcomeMessage(welcomeMessage);
                player.sendMessage('§7[§b#§7] §aCustom join message removed. The default message will be used.');
            }
        } else if (type === "leave") {
            if (leaveMessage === defaultLeaveMessage) {
                player.sendMessage('§7[§b#§7] §cNo custom leave message is set.');
            } else {
                leaveMessage = defaultLeaveMessage;
                saveLeaveMessage(leaveMessage);
                player.sendMessage('§7[§b#§7] §aCustom leave message removed. The default message will be used.');
            }
        }

        player.runCommandAsync('playsound random.break @s');
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
    const { player } = event;
    
    const message = welcomeMessage.replace("{name}", player.name);
    if (!player.hasTag('old')) {
        world.sendMessage(message);
        player.runCommandAsync('playsound random.bell @a');
        player.runCommandAsync('tag @s add old');
    }
});

world.afterEvents.playerLeave.subscribe((event) => {
    const { playerName } = event;
    
    const message = leaveMessage.replace("{name}", playerName);
    if (player.hasTag('old')) {
        world.sendMessage(message);
        world.runCommandAsync('playsound random.bell @a');
        player.runCommandAsync('tag @s remove old');
    }
});
