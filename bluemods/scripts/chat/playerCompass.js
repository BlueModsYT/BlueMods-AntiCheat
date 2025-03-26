import { world, system, EnchantmentTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { banPlayer, unbanPlayer, mutePlayer, unmutePlayer, freezePlayer, unfreezePlayer, operatorPlayer, unoperatorPlayer, notifyPlayer, unnotifyPlayer, trustedPlayer, untrustedPlayer } from "../systems/handler/ModHandler.js";
import { setHome, teleportHome, removeHome, listHomes } from "../commands/general.js"; 
import { showTeleportRequestForm, showPlayerSelectionForm, showOutgoingRequests, showIncomingRequests } from "../systems/handler/TeleportHandler.js";
import { ViewRewardsPanel, AddRewardPanel, RemoveRewardPanel, EditRewardPanel, CustomCooldownPanel } from "../systems/handler/ModuleHandler.js";
import { saveEnabledCommands } from "../commands/development/cmdtoggle.js";
import { ChatConfigurationPanel } from "./playerChat.js";
import { ModuleStatesPanel } from "../systems/isIllegal.js";
import { customFormUICodes } from "../ui/customFormUICodes.js";
import spawnManager from "../systems/handler/SpawnHandler.js";
import main from "../commands/config.js";

// all rights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.  

const teleportingPlayers = new Map();
const TELEPORT_COUNTDOWN = 5;
let bannedPlayers = [];

function isCommandEnabled(commandName) {  
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;  
}  

const isAuthorized = (player, commandName) => {  
    if (!isCommandEnabled(commandName)) {  
        ErrorPanel(player, `§cThis command §e${commandName} §cis currently disabled.\n\n\n\n\n\n\n\n\n`);  
        player.runCommandAsync(`playsound random.break @s`);  
        return false;  
    }  
    return true;  
};  

function ErrorPanel(player, errorMessage = "An error has occurred.") {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§cError Panel")
        .body(`§7${errorMessage}`)
        .button(customFormUICodes.action.buttons.positions.main_only + "§cClose Panel", "textures/ui/cancel")
        .button(customFormUICodes.action.buttons.positions.main_only + "§eBack to Menu", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === 1) {
            showCompassUI(player);
        }
    }).catch((error) => {
        console.error("Failed to show error panel:", error);
    });
}

world.afterEvents.itemUse.subscribe((event) => {
    const { itemStack, source } = event;

    if (itemStack.typeId === "bluemods:itemui" && source?.typeId === "minecraft:player") {
        showCompassUI(source);
        source.playSound("note.pling", { pitch: 1, volume: 0.4 });
    }
});

// 
// Public Panel
//

export function showCompassUI(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aPlayer Menu")
        .body("Choose an option:");

    form.button(customFormUICodes.action.buttons.positions.main_only + "Spawn", "textures/items/compass_item")
        .button(customFormUICodes.action.buttons.positions.main_only + "Teleport Request", "textures/items/ender_pearl")
        .button(customFormUICodes.action.buttons.positions.main_only + "RTP", "textures/items/redstone_dust")
        .button(customFormUICodes.action.buttons.positions.main_only + "Homes", "textures/items/bed_red")
        .button(customFormUICodes.action.buttons.positions.main_only + "About Addon", "textures/ui/icon_fall");

    let isAdmin = player.hasTag("admin");
    let adminButtons = 0;

    if (isAdmin) {
        form.button(customFormUICodes.action.buttons.positions.main_only + "Moderation Panel", "textures/ui/dev_glyph_color")
            .button(customFormUICodes.action.buttons.positions.main_only + "Operator Panel", "textures/ui/dev_glyph_color")
            .button(customFormUICodes.action.buttons.positions.main_only + "Modules", "textures/ui/icon_book_writable")
            .button(customFormUICodes.action.buttons.positions.main_only + "Miscellaneous", "textures/ui/mashup_world")
            .button(customFormUICodes.action.buttons.positions.main_only + "Report Manage Panel", "textures/ui/FriendsIcon");
        adminButtons = 5;
    } else {
        form.button(customFormUICodes.action.buttons.positions.main_only + "Report User Panel", "textures/ui/FriendsIcon");
    }

    form.show(player).then((response) => {
        if (response.canceled) return;

        let index = response.selection;

        switch (index) {
            case 0:
                handleSpawn(player);
                break;
            case 1:
                if (!isAuthorized(player, "!tpa")) return;
                showTeleportRequestForm(player);
                break;
            case 2:
                if (!isAuthorized(player, "!rtp")) return;
                handleRTP(player);
                break;
            case 3:
                if (!isAuthorized(player, "!home")) return;
                homeForm(player);
                break;
            case 4:
                AboutForm(player);
                break;
            default:
                if (isAdmin) {
                    switch (index - 5) {
                        case 0:
                            ModerationPanel(player);
                            break;
                        case 1:
                            OperatorPanel(player);
                            break;
                        case 2:
                            ModulesPanel(player);
                            break;
                        case 3:
                            MiscellaneousPanel(player);
                            break;
                        case 4:
                            ReportManagePanel(player);
                            break;
                    }
                } else if (index === 5) {
                    ReportUserPanel(player);
                }
                break;
        }
    }).catch((error) => {
        console.error("Failed to show form:", error);
    });
}

// 
// Moderation Panel
//

function ModerationPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aModeration Panel")
        .body("Choose an option:");

    form.button(customFormUICodes.action.buttons.positions.main_only + "Kick Player", "textures/items/nether_star")
        .button(customFormUICodes.action.buttons.positions.main_only + "Ban Player", "textures/items/paper")
        .button(customFormUICodes.action.buttons.positions.main_only + "Unban Player", "textures/items/paper")
        .button(customFormUICodes.action.buttons.positions.main_only + "Mute Player", "textures/items/paper")
        .button(customFormUICodes.action.buttons.positions.main_only + "Freeze Player", "textures/items/ice_bomb")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");

    form.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                if (!isAuthorized(player, "!kick")) return;
                    showKickPlayerForm(player);
                break;
            case 1:
                if (!isAuthorized(player, "!ban")) return;
                    showBanPlayerForm(player);
                break;
            case 2:
                if (!isAuthorized(player, "!ban")) return;
                    showUnbanPlayerForm(player);
                break;
            case 3:
                if (!isAuthorized(player, "!mute")) return;
                    showMutePlayerForm(player);
                break;
            case 4:
                if (!isAuthorized(player, "!freeze")) return;
                    showFreezePlayerForm(player);
                break;
            case 5:
                showCompassUI(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show moderation panel:", error);
    });
}

function OperatorPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aOperator Panel")
        .body("Choose an option:");
        
    form.button(customFormUICodes.action.buttons.positions.main_only + "Add Operator", "textures/items/name_tag")
        .button(customFormUICodes.action.buttons.positions.main_only + "Add Notification", "textures/items/name_tag")
        .button(customFormUICodes.action.buttons.positions.main_only + "Add Trusted", "textures/items/name_tag")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");
        
    form.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                if (!isAuthorized(player, "!op")) return;
                    showOperatorForm(player);
                break;
            case 1:
                if (!isAuthorized(player, "!notify")) return;
                    showNotifyForm(player);
                break;
            case 2:
                if (!isAuthorized(player, "!trusted")) return;
                    showTrustedForm(player);
                break;
            case 3:
                showCompassUI(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show operator panel:", error);
    });
}

//
// Non Operator Forms
//

function handleRTP(player) {
    const { id } = player;

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already in the process of teleporting. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aRandom teleporting in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: TELEPORT_COUNTDOWN });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);

        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            teleportingPlayers.delete(id);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation canceled because you moved.');
            player.runCommandAsync('playsound random.break @s');
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aRandom teleporting in §e${playerData.countdown} seconds§a...`);
            player.runCommandAsync('playsound random.orb @s');
        } else {
            system.clearRun(countdownInterval);
            player.runCommandAsync(`/effect @s resistance 25 255 true`);

            player.runCommandAsync(`/spreadplayers ~ ~ 500 1000 @s`)
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been randomly teleported.');
                    player.runCommandAsync('playsound random.levelup @s');
                })
                .catch((error) => {
                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });

            teleportingPlayers.delete(id);
        }
    }, 20);
}

function handleSpawn(player) {
    const { id } = player;
    const SPAWN_LOCATION = spawnManager.getSpawnLocation();

    if (!SPAWN_LOCATION) {
        player.sendMessage('§7[§c-§7] §cSpawn location has not been set by an admin.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already teleporting to spawn. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aTeleporting to spawn in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: 5 });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation to spawn canceled because you moved.');
            player.runCommandAsync('playsound random.break @s');
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to spawn in §e${playerData.countdown} seconds§a...`);
            player.runCommandAsync('playsound random.orb @s');
        } else {
            player.runCommandAsync(`tp @s ${SPAWN_LOCATION.x} ${SPAWN_LOCATION.y} ${SPAWN_LOCATION.z}`)
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been teleported to spawn.');
                    player.runCommandAsync('playsound random.levelup @s');
                    // Notification for Admins
                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!spawn `);
                        admin.runCommandAsync(`playsound note.pling @s`);
                    });
                })
                .catch(error => {
                    player.sendMessage('§7[§c-§7] §cError: Teleportation failed. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });

            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
        }
    }, 20);
}

function AboutForm(player) {
    const devs = main.bluemods.join("§7, §a"); 

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aAbout Addon")
        .body(
            `§l§bBlueMods §fAnti§cCheat§r\n` +
            `§7- Version: ${main.bmversion}\n` +
            `§7- Developers: §a${devs}\n` +
            `§7- Description: ${main.bmdescription}\n\n` +
            `§eClick the button below to copy the Discord link!`
        )
        
    form.button(customFormUICodes.action.buttons.positions.main_only + "Copy Discord Link")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === 0) {
            player.sendMessage("§7[§b#§7] §aDiscord Link: §ehttps://discord.gg/ppPT3MvgCk");
            player.sendMessage("§7[§b#§7] §aPlease manually copy the link from the chat.");
        } else if (response.selection === 1) {
            showCompassUI(player);
        }
    }).catch((error) => {
        console.error("Failed to show About form:", error);
    });
}

//
// Additional Forms for Admin Actions
//

function showKickPlayerForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);

    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aKick Player")
        .dropdown("Select Player:", playerNames)
        .textField("Reason:", "Enter reason...");

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [selectedPlayerIndex, reason] = response.formValues;
        const targetPlayer = players[selectedPlayerIndex];

        if (!targetPlayer) {
            player.sendMessage("§7[§b#§7] §cNo player selected.");
            return;
        }

        if (targetPlayer.id === player.id) {
            player.sendMessage("§7[§b#§7] §cYou cannot kick yourself.");
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        targetPlayer.runCommandAsync(`kick "${targetPlayer.name}" "§bBlueMods §7>> You have been kicked.\n§eReason: §c${reason}"`);
        player.sendMessage(`§7[§b#§7] §e${targetPlayer.name} §ahas been kicked.`);
        player.runCommandAsync('playsound random.levelup @s');
    }).catch((error) => {
        console.error("Failed to show kick player form:", error);
    });
}

function showBanPlayerForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);

    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aBan Player")
        .dropdown("Select Player:", playerNames)
        .textField("Reason:", "Enter reason...")
        .textField("Duration (e.g., 1h, 2d):", "Optional");

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [selectedPlayerIndex, reason, duration] = response.formValues;
        const targetPlayer = players[selectedPlayerIndex];
        
        if (!targetPlayer) {
            player.sendMessage("§7[§b#§7] §cNo player selected.");
            return;
        }

        if (targetPlayer.id === player.id) {
            player.sendMessage("§7[§b#§7] §cYou cannot ban yourself.");
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        if (targetPlayer) {
            banPlayer(targetPlayer.name, reason, player, duration);
        }
    }).catch((error) => {
        console.error("Failed to show ban player form:", error);
    });
}

function showUnbanPlayerForm(player) {
    const bannedPlayerNames = bannedPlayers.map(p => p.name);

    if (bannedPlayerNames.length === 0) {
        player.sendMessage("§7[§b#§7] §cNo players are currently banned.");
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aUnban Player")
        .dropdown("Select Player to Unban:", bannedPlayerNames);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [selectedPlayerIndex] = response.formValues;
        const targetPlayerName = bannedPlayerNames[selectedPlayerIndex];

        if (targetPlayerName) {
            unbanPlayer(targetPlayerName, player);
        }
    }).catch((error) => {
        console.error("Failed to show unban player form:", error);
    });
}

function showMutePlayerForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);

    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aMute Player")
        .dropdown("Select Player:", playerNames)
        .toggle("Mute Player", true);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [selectedPlayerIndex, muteToggle] = response.formValues;
        const targetPlayer = players[selectedPlayerIndex];
        
        if (!targetPlayer) {
            player.sendMessage("§7[§b#§7] §cNo player selected.");
            return;
        }

        if (targetPlayer.id === player.id) {
            player.sendMessage("§7[§b#§7] §cYou cannot mute yourself.");
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        if (targetPlayer) {
            if (muteToggle) {
                mutePlayer(targetPlayer.name, player);
            } else {
                unmutePlayer(targetPlayer.name, player);
            }
        }
    }).catch((error) => {
        console.error("Failed to show mute/unmute player form:", error);
    });
}

function showFreezePlayerForm(player) {
    const players = world.getPlayers();
    const playerNames = players.map(p => p.name);

    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aFreeze Player")
        .dropdown("Select Player:", playerNames)
        .toggle("Freeze Player", true);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [selectedPlayerIndex, freezeToggle] = response.formValues;
        const targetPlayer = players[selectedPlayerIndex];
        
        if (!targetPlayer) {
            player.sendMessage("§7[§b#§7] §cNo player selected.");
            return;
        }

        if (targetPlayer.id === player.id) {
            player.sendMessage("§7[§b#§7] §cYou cannot freeze yourself.");
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        if (targetPlayer) {
            if (freezeToggle) {
                freezePlayer(targetPlayer.name, player);
            } else {
                unfreezePlayer(targetPlayer.name, player);
            }
        }
    }).catch((error) => {
        console.error("Failed to show freeze/unfreeze player form:", error);
    });
}

//
// Operator Panel
//

function showOperatorForm(player) {
    const players = world.getPlayers();

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aOperator Panel")
        .body("Select a player to manage operator status:");

    players.forEach((p) => {
        if (p.hasTag("admin")) {
            form.button(customFormUICodes.action.buttons.positions.main_only + `${p.name}\n§7[ §aOperator Mode §7]`, "textures/ui/op");
        } else {
            form.button(customFormUICodes.action.buttons.positions.main_only + `${p.name}\n§7[ §cNot Operator §7]`, "textures/ui/deop");
        }
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§7[§b#§7] §cOperator panel closed.");
            return;
        }

        const selectedIndex = response.selection;

        if (selectedIndex === players.length) {
            OperatorPanel(player);
            return;
        }

        const selectedPlayer = players[selectedIndex];

        if (selectedPlayer) {
            if (selectedPlayer.hasTag("admin")) {
                unoperatorPlayer(selectedPlayer.name, player);
                showOperatorForm(player);
            } else {
                operatorPlayer(selectedPlayer.name, player);
                showOperatorForm(player);
            }
        } else {
            player.sendMessage("§7[§c-§7] §cNo player selected.");
        }
    }).catch((error) => {
        console.error("Failed to show operator form:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while showing the operator panel.");
    });
}

function showNotifyForm(player) {
    const players = world.getPlayers();

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aNotify Panel")
        .body("Select a player to manage notify status:");

    players.forEach((p) => {
        if (p.hasTag("notify")) {
            form.button(customFormUICodes.action.buttons.positions.main_only + `${p.name}\n§7[ §aNotified Mode §7]`, "textures/items/paper");
        } else {
            form.button(customFormUICodes.action.buttons.positions.main_only + `${p.name}\n§7[ §cNot Notified §7]`, "textures/items/paper");
        }
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§7[§b#§7] §cNotify panel closed.");
            return;
        }

        const selectedIndex = response.selection;

        if (selectedIndex === players.length) {
            OperatorPanel(player);
            return;
        }

        const selectedPlayer = players[selectedIndex];

        if (selectedPlayer) {
            if (selectedPlayer.hasTag("notify")) {
                unnotifyPlayer(selectedPlayer.name, player);
                showNotifyForm(player);
            } else {
                notifyPlayer(selectedPlayer.name, player);
                showNotifyForm(player);
            }
        } else {
            player.sendMessage("§7[§c-§7] §cNo player selected.");
        }
    }).catch((error) => {
        console.error("Failed to show notify form:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while showing the notify panel.");
    });
}

function showTrustedForm(player) {
    const players = world.getPlayers();

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aTrusted Panel")
        .body("Select a player to manage trusted status:");

    players.forEach((p) => {
        if (p.hasTag("trusted")) {
            form.button(customFormUICodes.action.buttons.positions.main_only + `${p.name}\n§7[ §aTrusted Mode §7]`, "textures/items/name_tag");
        } else {
            form.button(customFormUICodes.action.buttons.positions.main_only + `${p.name}\n§7[ §cNot Trusted §7]`, "textures/items/name_tag"); 
        }
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§7[§b#§7] §cTrusted panel closed.");
            return;
        }

        const selectedIndex = response.selection;

        if (selectedIndex === players.length) {
            OperatorPanel(player);
            return;
        }

        const selectedPlayer = players[selectedIndex];

        if (selectedPlayer) {
            if (selectedPlayer.hasTag("trusted")) {
                untrustedPlayer(selectedPlayer.name, player);
                showTrustedForm(player);
            } else {
                trustedPlayer(selectedPlayer.name, player);
                showTrustedForm(player);
            }
        } else {
            player.sendMessage("§7[§c-§7] §cNo player selected.");
        }
    }).catch((error) => {
        console.error("Failed to show trusted form:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while showing the trusted panel.");
    });
}

//
// Home Panel
//

function homeForm(player) {
    if (!isAuthorized(player, "!home")) return;
    const homeDataJson = player.getDynamicProperty("playerHome");
    const homes = homeDataJson ? JSON.parse(homeDataJson) : {};

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aHomes")
        .body("Choose an option:");

    for (const homeName in homes) {
        form.button(customFormUICodes.action.buttons.positions.main_only + `§a${homeName}`, "textures/items/bed_green");
    }

    form.button(customFormUICodes.action.buttons.positions.main_only + "§eSet Home", "textures/items/bed_yellow")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cRemove Home", "textures/items/bed_red")
        .button(customFormUICodes.action.buttons.positions.main_only + "§bList Homes", "textures/items/bed_blue")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");

    form.show(player).then((response) => {
        if (response.canceled) return;

        const selectedIndex = response.selection;

        if (selectedIndex < Object.keys(homes).length) {
            const homeName = Object.keys(homes)[selectedIndex];
            teleportHome(player, homeName);
        } else {
            switch (selectedIndex - Object.keys(homes).length) {
                case 0:
                    showSetHomeForm(player);
                    break;
                case 1:
                    showRemoveHomeForm(player);
                    break;
                case 2:
                    listHomes(player);
                    break;
                case 3:
                    showCompassUI(player);
                    break;
            }
        }
    }).catch((error) => {
        console.error("Failed to show home form:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while showing the home menu.");
    });
}

function showSetHomeForm(player) {
    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aSet Home")
        .textField("Enter a name for your home:", "Home Name");

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§7[§b#§7] §cSet home canceled.");
            return;
        }

        const [homeName] = response.formValues;
        if (!homeName) {
            player.sendMessage("§7[§c-§7] §cPlease specify a home name.");
            return;
        }

        setHome(player, homeName);
    }).catch((error) => {
        console.error("Failed to show set home form:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while setting your home.");
    });
}

function showRemoveHomeForm(player) {
    const homeDataJson = player.getDynamicProperty("playerHome");
    const homes = homeDataJson ? JSON.parse(homeDataJson) : {};

    if (Object.keys(homes).length === 0) {
        player.sendMessage("§7[§c-§7] §cYou don't have any homes to remove.");
        return;
    }

    const form = new ModalFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aRemove Home")
        .dropdown("Select a home to remove:", Object.keys(homes));

    form.show(player).then((response) => {
        if (response.canceled) {
            player.sendMessage("§7[§b#§7] §cRemove home canceled.");
            return;
        }

        const [selectedIndex] = response.formValues;
        const homeName = Object.keys(homes)[selectedIndex];

        removeHome(player, homeName);
    }).catch((error) => {
        console.error("Failed to show remove home form:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while removing your home.");
    });
}


//
// Modules Panels
//

export function ModulesPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aModules Panels")
        .body("Choose an option:");

    form.button(customFormUICodes.action.buttons.positions.main_only + "Commands", "textures/ui/recipe_book_icon")
        .button(customFormUICodes.action.buttons.positions.main_only + "Chat Configuration", "textures/ui/recipe_book_icon")
        .button(customFormUICodes.action.buttons.positions.main_only + "Module States", "textures/ui/recipe_book_icon")
        .button(customFormUICodes.action.buttons.positions.main_only + "Modules | Daily Rewards", "textures/ui/recipe_book_icon")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");

    form.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                CommandsPanel(player);
                break;
            case 1:
                ChatConfigurationPanel(player);
                break;
            case 2:
                ModuleStatesPanel(player);
                break;
            case 3:
                DailyRewardsPanel(player);
                break;
            case 4:
                showCompassUI(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show modules panel:", error);
    });
}

function CommandsPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aModules Toggle");

    const commandKeys = Object.keys(main.enabledCommands);

    for (const command of commandKeys) {
        const isEnabled = main.enabledCommands[command]; 
        const statusText = isEnabled ? "§aEnabled" : "§cDisabled";
        const statusIcon = isEnabled
            ? "textures/ui/realms_green_check.png"
            : "textures/ui/redX1.png";

        form.button(customFormUICodes.action.buttons.positions.main_only + `§e${command}\n§7[ ${statusText} §7]`, statusIcon);
    }

    const backButtonIndex = commandKeys.length;
    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === backButtonIndex) {
            return ModulesPanel(player);
        }

        const selectedCommand = commandKeys[response.selection];
        main.enabledCommands[selectedCommand] = !main.enabledCommands[selectedCommand];

        saveEnabledCommands();

        player.sendMessage(`§7[§b#§7] §aToggled §e${selectedCommand} §7to §b${main.enabledCommands[selectedCommand] ? "Enabled" : "Disabled"}§7.`);
        player.runCommandAsync("playsound note.bell @s");

        CommandsPanel(player);
    }).catch((error) => {
        console.error("Failed to show modules panel:", error);
    });
}

export function DailyRewardsPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aDaily Rewards")
        .body("§7Configure your daily rewards!");

    form.button(customFormUICodes.action.buttons.positions.main_only + "§aView Rewards", "textures/ui/icon_book_writable")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aAdd Reward", "textures/ui/color_plus")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cRemove Reward", "textures/ui/minus")
        .button(customFormUICodes.action.buttons.positions.main_only + "§eEdit Reward", "textures/ui/editIcon")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aCustom Cooldown", "textures/items/clock_item")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;
        
        switch (response.selection) {
            case 0:
                ViewRewardsPanel(player);
                break;
            case 1:
                AddRewardPanel(player);
                break;
            case 2:
                RemoveRewardPanel(player);
                break;
            case 3:
                EditRewardPanel(player);
                break;
            case 4:
                CustomCooldownPanel(player);
                break;
            case 5:
                ModulesPanel(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show daily rewards panel:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while opening the daily rewards panel.");
    });
}

//
// Miscellaneous
//

function MiscellaneousPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aMiscellaneous")
        .body("Choose an option:");

    form.button(customFormUICodes.action.buttons.positions.main_only + "§bFloating Text", "textures/items/egg_mask")
        .button(customFormUICodes.action.buttons.positions.main_only + "§eRepair Item", "textures/ui/strength_effect")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aDupe Item", "textures/ui/copy")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aEnchant Item", "textures/items/book_enchanted")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");

    form.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                FloatingPanel(player);
                break;
            case 1:
                RepairItemPanel(player);
                break;
            case 2:
                DupeItemPanel(player);
                break;
            case 3:
                EnchantItemPanel(player);
                break;
            case 4:
                showCompassUI(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show modules panel:", error);
    });
}

function FloatingPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aFloating Text")
        .body("Choose an option:");

    form.button(customFormUICodes.action.buttons.positions.main_only + "§aCreate Floating Text", "textures/items/egg_mask")
        .button(customFormUICodes.action.buttons.positions.main_only + "§eMove Text", "textures/ui/book_shiftright_default")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cRemove Text", "textures/ui/book_trash_default")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                CreateFloatText(player);
                break;
            case 1:
                MoveFloatText(player);
                break;
            case 2:
                RemoveFloatText(player);
                break;
            case 3:
                MiscellaneousPanel(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show floating panel:", error);
    });
}

function CreateFloatText(player) {
    const defaultCoords = `${Math.floor(player.location.x)} ${Math.floor(player.location.y + 1)} ${Math.floor(player.location.z)}`;

    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §bFloating Text")
        .textField("Enter Text:", "Example: Welcome to Spawn!")
        .textField("Input your Coordinates: (e.g. 10 23 12 or ~ ~1 ~-1)", defaultCoords);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const text = response.formValues[0] || "§eDefault Text";
        const coords = parseCoordinates(player, response.formValues[1]);

        const [x, y, z] = coords;
        player.runCommandAsync(`summon bluemods:floating_text ${x} ${y} ${z} ~~ minecraft:become_neutral "${text}"`);
        player.sendMessage(`§aFloating text created: §e"${text}"§a at (§b${x}, ${y}, ${z}§a)`);
    }).catch((error) => {
        console.error("Error in FloatingPanel:", error);
    });
}

function MoveFloatText(player) {
    const floatingTexts = world.getDimension("overworld").getEntities({ type: "bluemods:floating_text" });

    if (floatingTexts.length === 0) {
        player.sendMessage("§cNo floating text entities found.");
        return;
    }

    const entityNames = floatingTexts.map(entity => entity.nameTag || "Unnamed Floating Text");

    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §eMove Floating Text")
        .dropdown("Select Floating Text to Move:", entityNames)
        .textField("Enter New Coordinates:", "e.g. 10 23 12, ~ ~1 ~, or ~ ~-1 ~", "~ ~ ~");

    form.show(player).then((response) => {
        if (response.canceled) return;

        const selectedIndex = response.formValues[0];
        const selectedEntity = floatingTexts[selectedIndex];

        const coordsInput = response.formValues[1].trim() || "~ ~ ~";
        const [x, y, z] = parseCoordinates(player, coordsInput);

        selectedEntity.teleport({ x, y, z }, { dimension: world.getDimension("overworld"), rotation: { x: 0, y: 0 } });

        player.sendMessage(`§eFloating text "${selectedEntity.nameTag}" moved to (§b${x}, ${y}, ${z}§e)`);
    }).catch((error) => {
        console.error("Error in MoveFloatText form:", error);
        player.sendMessage("§cFailed to process your request. Please try again.");
    });
}

function parseCoordinates(player, input) {
    const coordsInput = input.trim().split(" ");
    if (coordsInput.length !== 3) {
        throw new Error("Invalid coordinate format. Use 'x y z' or '~ ~ ~'.");
    }

    return coordsInput.map((coord, i) => {
        if (coord === "~") {
            return Math.floor([player.location.x, player.location.y, player.location.z][i]);
        } else if (coord.startsWith("~")) {
            const offset = coord.length > 1 ? Number(coord.substring(1)) : 0;
            return Math.floor([player.location.x, player.location.y, player.location.z][i]) + offset;
        } else {
            return isNaN(Number(coord)) ? Math.floor([player.location.x, player.location.y + 1, player.location.z][i]) : Number(coord);
        }
    });
}

function extractFloatingTexts(statusMessage) {
    if (!statusMessage) return [];
    
    return statusMessage
        .split("\n")
        .map(line => line.match(/name=(.+?),/)?.[1])
        .filter(Boolean);
}

function RemoveFloatText(player) {
    player.sendMessage("§cUse a §lBarrier Block§r§c and interact with the floating text to remove it.");
}

function RepairItemPanel(player) {
    const inventory = player.getComponent("minecraft:inventory").container;
    let itemList = [];
    let slotList = [];

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.hasComponent("minecraft:durability")) {
            itemList.push(`${item.typeId} (${item.getComponent("minecraft:durability").damage} dmg)`);
            slotList.push(i);
        }
    }

    if (itemList.length === 0) {
        return player.sendMessage("§cYou have no repairable items in your inventory!");
    }

    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §eRepair Item")
        .dropdown("Choose an item to repair:", itemList);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const selectedSlot = slotList[response.formValues[0]];
        const item = inventory.getItem(selectedSlot);

        if (!item) return player.sendMessage("§cSelected item is no longer in your inventory!");

        item.getComponent("minecraft:durability").damage = 0;
        inventory.setItem(selectedSlot, item);

        player.sendMessage(`§aYour §e${item.typeId}§a has been fully repaired!`);
    });
}

function DupeItemPanel(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory) return player.sendMessage("§7[§b#§7] §cFailed to access inventory!");

    const container = inventory.container;
    if (!container) return player.sendMessage("§7[§b#§7] §cInventory is empty!");

    const items = [];
    
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item) items.push({ slot: i, item });
    }

    if (!items.length) return player.sendMessage("§7[§b#§7] §cYour inventory is empty!");

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aDupe Item")
        .body("Select an item to duplicate:");

    items.forEach(entry => {
        form.button(customFormUICodes.action.buttons.positions.main_only + `§e${entry.item.typeId} (§b${entry.item.amount}§e)`, `textures/items/${entry.item.typeId.split(":")[1]}` || `textures/ui/${entry.item.typeId.split(":")[1]}` || `textures/blocks/${entry.item.typeId.split(":")[1]}`);
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === items.length) return MiscellaneousPanel(player);

        const selectedItem = items[response.selection];
        if (!selectedItem) return player.sendMessage("§7[§b#§7] §cItem no longer exists!");

        DuplicateItem(player, selectedItem);
    });
}

function DuplicateItem(player, selectedItem) {
    const inventory = player.getComponent("minecraft:inventory").container;
    if (!inventory) return;

    const itemStack = selectedItem.item.clone();
    itemStack.amount *= 2;

    const added = inventory.addItem(itemStack);
    if (added) {
        player.sendMessage(`§7[§b#§7] §aSuccessfully duplicated §e${selectedItem.item.typeId}§a!`);
    }
}

function EnchantItemPanel(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory) return player.sendMessage("§7[§b#§7] §cFailed to access inventory!");

    const container = inventory.container;
    if (!container) return player.sendMessage("§7[§b#§7] §cInventory is empty!");

    const items = [];
    
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item) items.push({ slot: i, item });
    }

    if (!items.length) return player.sendMessage("§7[§b#§7] §cYour inventory is empty!");

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §dEnchant Item")
        .body("Select an item to enchant:");

    items.forEach(entry => {
        form.button(customFormUICodes.action.buttons.positions.main_only + `§e${entry.item.typeId} (§b${entry.item.amount}§e)`, `textures/items/${entry.item.typeId.split(":")[1]}` || `textures/ui/${entry.item.typeId.split(":")[1]}` || `textures/blocks/${entry.item.typeId.split(":")[1]}`);
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === items.length) return MiscellaneousPanel(player);

        const selectedItem = items[response.selection];
        if (!selectedItem) return player.sendMessage("§7[§b#§7] §cItem no longer exists!");

        SelectEnchantmentPanel(player, selectedItem);
    });
}

function SelectEnchantmentPanel(player, item) {
    const enchantmentTypes = Object.values(EnchantmentTypes);

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §dSelect Enchantment")
        .body(`Select an enchantment for §e${item.typeId}:`);

    enchantmentTypes.forEach(enchant => {
        form.button(customFormUICodes.action.buttons.positions.main_only + `§b${enchant.id} §7(Max: ${enchant.maxLevel})`);
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === enchantmentTypes.length) return EnchantItemPanel(player);

        const selectedEnchantment = enchantmentTypes[response.selection];
        ApplyEnchantment(player, item, selectedEnchantment);
    });
}

function ApplyEnchantment(player, item, enchantment) {
    const enchant = new EnchantmentTypes[enchantment.id]();
    enchant.level = enchantment.maxLevel;

    item.enchantments.addEnchantment(enchant);

    player.sendMessage(`§7[§b#§7] §aApplied §b${enchantment.id} ${enchantment.maxLevel} §ato §e${item.typeId}!`);
}

//
// Report Panels
//

const REPORTS_KEY = "reports";

function generateReportId() {
    return `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function addReport(type, reporter, reportedPlayerName, details) {
    let reports = getAllReports();
    const newReport = {
        id: generateReportId(),
        type,
        reporter,
        reportedPlayerName,
        details,
        resolved: false
    };

    reports.push(newReport);
    world.setDynamicProperty(REPORTS_KEY, JSON.stringify(reports));
}

function getAllReports() {
    const storedReports = world.getDynamicProperty(REPORTS_KEY);
    return storedReports ? JSON.parse(storedReports) : [];
}

function resolveReport(report) {
    const reports = getAllReports();
    const updatedReports = reports.map(r => {
        if (r.id === report.id) {
            return { ...r, resolved: true };
        }
        return r;
    });
    world.setDynamicProperty(REPORTS_KEY, JSON.stringify(updatedReports));
}

function deleteReport(report) {
    const reports = getAllReports();
    const updatedReports = reports.filter(r => r.id !== report.id);
    world.setDynamicProperty(REPORTS_KEY, JSON.stringify(updatedReports));
}

function ReportUserPanel(player) {
    const onlinePlayers = world.getPlayers().map(p => p.name);

    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §eReport User")
        .dropdown("Select a Player to Report:", onlinePlayers)
        .textField("Or Enter Player Name:", "Type the player's name...")
        .dropdown("Select Report Type:", ["Advertisement", "Cheating", "Harassment", "Spamming", "Other"])
        .textField("Provide Details:", "Explain the issue...");

    form.show(player).then((response) => {
        if (response.canceled) return;

        const selectedPlayerIndex = response.formValues[0];
        const manualPlayerName = response.formValues[1].trim();
        const reportType = ["Advertisement", "Cheating", "Harassment", "Spamming", "Other"][response.formValues[2]];
        const reportDetails = response.formValues[3].trim();

        const reportedPlayerName = manualPlayerName || onlinePlayers[selectedPlayerIndex];

        if (!reportedPlayerName) {
            player.sendMessage("§cPlease select or enter a player name.");
            return;
        }

        if (reportedPlayerName === player.name) {
            player.sendMessage("§cYou cannot report yourself.");
            return;
        }

        if (!reportDetails) {
            player.sendMessage("§cPlease provide details for your report.");
            return;
        }

        addReport(reportType, player.name, reportedPlayerName, reportDetails);

        const reportMessage = `§7[§b#§7] §eNew Report:\n§7- Type: §e${reportType}\n§7- Reporter: §e${player.name}\n§7- Reported Player: §e${reportedPlayerName}\n§7- Details: §e${reportDetails}`;

        const admins = world.getPlayers({ tags: ["admin"] });
        if (admins.length === 0) {
            console.warn("No admins online to receive reports.");
        } else {
            admins.forEach(admin => {
                admin.sendMessage(reportMessage);
                admin.runCommandAsync("playsound random.orb @s");
            });
        }

        player.sendMessage("§aYour report has been submitted. Thank you!");
    }).catch((error) => {
        console.error("Error in ReportUserPanel:", error);
        player.sendMessage("§cFailed to submit your report. Please try again.");
    });
}

function ReportManagePanel(player) {
    const reports = getAllReports().filter(r => !r.resolved);

    if (reports.length === 0) {
        player.sendMessage("§aThere are no active reports.");
        return;
    }

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §eManage Reports")
        .body("Select a report to manage:");

    reports.forEach((report, index) => {
        form.button(customFormUICodes.action.buttons.positions.main_only + `§eReport #${index + 1}\n§7- Type: §e${report.type}\n§7- Reporter: §e${report.reporter}\n§7- Reported Player: §e${report.reportedPlayerName}`);
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === reports.length) {
            showCompassUI(player);
            return;
        }

        const selectedReport = reports[response.selection];
        manageReportDetails(player, selectedReport);
    }).catch((error) => {
        console.error("Error in ReportManagePanel:", error);
        player.sendMessage("§cFailed to load reports. Please try again.");
    });
}

function manageReportDetails(player, report) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §eReport Details")
        .body(`§7- Type: §e${report.type}\n§7- Reporter: §e${report.reporter}\n§7- Reported Player: §e${report.reportedPlayerName}\n§7- Details: §e${report.details}`)
        .button(customFormUICodes.action.buttons.positions.main_only + "Resolve Report", "textures/ui/realms_green_check.png")
        .button(customFormUICodes.action.buttons.positions.main_only + "Delete Report", "textures/ui/redX1.png")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                resolveReport(report);
                player.sendMessage(`§aReport by §e${report.reporter} §ahas been resolved.`);
                break;
            case 1:
                deleteReport(report);
                player.sendMessage(`§aReport by §e${report.reporter} §ahas been deleted.`);
                break;
            case 2:
                ReportManagePanel(player);
                break;
        }
    }).catch((error) => {
        console.error("Error in manageReportDetails:", error);
        player.sendMessage("§cFailed to manage report. Please try again.");
    });
}
