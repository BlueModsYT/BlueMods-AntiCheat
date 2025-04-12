import { world } from "@minecraft/server";
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
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!floatingtext")) return;

    const fullArgs = data.message.split(" ");
    if (fullArgs.length < 2) {
        player.sendMessage("§cUsage: !floatingtext \"<Text>\" [x y z]");
        player.sendMessage("§eExample: !floatingtext \"Welcome to spawn\" ~ ~1 ~");
        return;
    }

    // Check if the message starts with quotes
    if (!data.message.includes("\"")) {
        player.sendMessage("§7[§a-§7] §cError: Text must be enclosed in quotation marks (\")");
        player.sendMessage("§eExample: !floatingtext \"Your text here\"");
        return;
    }

    // Extract text between quotes
    const textMatch = data.message.match(/"([^"]*)"/);
    if (!textMatch) {
        player.sendMessage("§7[§a-§7] §cError: Could not parse text. Make sure to use proper quotation marks");
        return;
    }

    const text = textMatch[1];
    const remainingArgs = data.message.slice(textMatch.index + textMatch[0].length).trim().split(" ").filter(arg => arg);

    let location = {
        x: player.location.x,
        y: player.location.y + 1,  // ~1 (1 block above player)
        z: player.location.z
    };

    // Process coordinates if provided (3 arguments after the quoted text)
    if (remainingArgs.length >= 3) {
        const processCoord = (coord, playerCoord) => {
            if (coord.includes('~')) {
                const offset = coord.replace('~', '');
                return playerCoord + (offset ? parseFloat(offset) : 0);
            }
            return parseFloat(coord);
        };

        try {
            location = {
                x: processCoord(remainingArgs[0], player.location.x),
                y: processCoord(remainingArgs[1], player.location.y),
                z: processCoord(remainingArgs[2], player.location.z)
            };
        } catch (e) {
            player.sendMessage("§7[§a-§7] §cInvalid coordinates. Use numbers or ~ notation");
            player.sendMessage("§eExample: !floatingtext \"Text\" 100 64 100");
            player.sendMessage("§eExample: !floatingtext \"Text\" ~ ~1 ~");
            return;
        }
    }

    // Create floating text entity
    dimension.spawnEntity("bluemods:floating_text", location);
    const entities = dimension.getEntitiesAtBlockLocation(location);
    entities.forEach(entity => {
        if (entity.typeId === "bluemods:floating_text") {
            entity.nameTag = text;
        }
    });

    player.sendMessage(`§7[§a-§7] §aAdded floating text "${text}" at ${location.x.toFixed(1)} ${location.y.toFixed(1)} ${location.z.toFixed(1)}`);
});
