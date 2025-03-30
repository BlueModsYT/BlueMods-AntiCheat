import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { showCompassUI } from "../../chat/playerCompass.js";

const playerRequest = {};
const cooldowns = {};
const tpablocks = {};
const TELEPORT_COUNTDOWN = 5;
const REQUEST_COOLDOWN = 30;

export function showTeleportRequestForm(player) {
    const toggleButton = getTeleportToggleButton(player);

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aTeleport Request")
        .body("Choose an option:")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aRequest", "textures/items/ender_pearl")
        .button(customFormUICodes.action.buttons.positions.main_only + "§eOutgoing", "textures/items/ender_pearl")
        .button(customFormUICodes.action.buttons.positions.main_only + "§fIncoming", "textures/items/ender_pearl")
        .button(customFormUICodes.action.buttons.positions.main_only + "§dBlock List", "textures/items/blaze_powder")
        .button(customFormUICodes.action.buttons.positions.main_only + toggleButton.text, toggleButton.icon)
        .button(customFormUICodes.action.buttons.positions.main_only + "§cBack to Menu", "textures/blocks/barrier");

    form.show(player).then((response) => {
        if (response.canceled) return player.sendMessage("§7[§b#§7] §cTeleport request menu closed.");

        switch (response.selection) {
            case 0:
                showPlayerSelectionForm(player);
                break;
            case 1:
                showOutgoingRequests(player);
                break;
            case 2:
                showIncomingRequests(player);
                break;
            case 3:
                showBlockList(player);
                break;
            case 4:
                toggleTeleportRequests(player);
                break;
            case 5:
                showCompassUI(player);
                break;
        }
    }).catch((error) => {
        console.error("Failed to show form:", error);
    });
}

export function showPlayerSelectionForm(player) {
    const players = world.getPlayers().filter(p => p.id !== player.id);
    if (!players.length) return player.sendMessage("§7[§b#§7] §cNo players available.");

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aSelect Player")
        .body("Choose a player to send a teleport request:");
    
    players.forEach(p => form.button(customFormUICodes.action.buttons.positions.main_only + "§a" + p.name, "textures/ui/icon_steve"));
    form.button(customFormUICodes.action.buttons.positions.main_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return player.sendMessage("§7[§b#§7] §cPlayer selection canceled.");
        if (response.selection === players.length) {
            return showTeleportRequestForm(player);
        }

        sendTeleportRequest(player, players[response.selection]);
    });
}

export function showBlockList(player) {
    const blockedPlayers = tpablocks[player.id] || [];
    const players = world.getPlayers().filter(p => p.id !== player.id);

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aBlocked Players")
        .body("Select a player to block/unblock:")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aBack", "textures/ui/arrow_left");

    players.forEach(p => {
        const isBlocked = blockedPlayers.includes(p.id);
        form.button(customFormUICodes.action.buttons.positions.main_only + `${isBlocked ? "§dUnblock" : "§dBlock"}§7: §a${p.name}`, "textures/ui/icon_steve");
    });

    form.show(player).then((response) => {
        if (response.canceled || response.selection === 0) {
            return showTeleportRequestForm(player);
        }

        const selectedPlayer = players[response.selection - 1];
        if (!selectedPlayer) return;

        if (blockedPlayers.includes(selectedPlayer.id)) {
            tpablocks[player.id] = blockedPlayers.filter(id => id !== selectedPlayer.id);
            player.sendMessage(`§7[§b#§7] §aYou have unblocked §e${selectedPlayer.name}.`);
        } else {
            blockedPlayers.push(selectedPlayer.id);
            tpablocks[player.id] = blockedPlayers;
            player.sendMessage(`§7[§b#§7] §cYou have blocked §e${selectedPlayer.name}.`);
        }
    });
}

export function sendTeleportRequest(sender, target) {
    if (tpablocks[target.id]?.includes("teleport_requests")) {
        return sender.sendMessage(`§7[§b#§7] §c${target.name} has teleport requests disabled.`);
    }

    if (tpablocks[target.id]?.includes(sender.id)) {
        return sender.sendMessage(`§7[§b#§7] §cYou are blocked from sending requests to §e${target.name}`);
    }

    if (cooldowns[sender.id] && cooldowns[sender.id] > Date.now()) {
        return sender.sendMessage(`§7[§b#§7] §cYou must wait before sending another request.`);
    }

    sender.sendMessage(`§7[§b#§7] §aRequest sent to §e${target.name}`);
    target.sendMessage(`§7[§b#§7] §e${sender.name} §ahas sent you a teleport request. type §e"§3!tpa accept§e" §ato accept the request.`);
    system.run(() => sender.runCommand(`playsound note.bell @s`));
    system.run(() => target.runCommand(`playsound random.orb @s`));

    playerRequest[target.id] = { sender: sender.id, senderName: sender.name, target: target.id, targetName: target.name };
    cooldowns[sender.id] = Date.now() + REQUEST_COOLDOWN * 1000;
}

export function acceptTeleportRequest(player) {
    const request = playerRequest[player.id];
    if (!request) return player.sendMessage("§7[§b#§7] §cNo pending teleport requests.");
    
    const sender = world.getPlayers().find(p => p.id === request.sender);
    if (!sender) return player.sendMessage("§7[§b#§7] §cThe requester is no longer online.");

    player.sendMessage(`§7[§b#§7] §aTeleport request accepted. Teleporting in §e${TELEPORT_COUNTDOWN} §aseconds.`);
    sender.sendMessage(`§7[§b#§7] §e${player.name} §ahas accepted your teleport request.`);

    let countdown = TELEPORT_COUNTDOWN;
    const startPosition = sender.location;
    let teleportCancelled = false;

    function tick() {
        if (teleportCancelled) return;

        const currentPosition = sender.location;
        if (currentPosition.x !== startPosition.x || currentPosition.y !== startPosition.y || currentPosition.z !== startPosition.z) {
            sender.sendMessage("§7[§b#§7] §cTeleport cancelled because you moved!");
            player.sendMessae("§7[§b#§7] §cTeleport cancelled because the requester moved!");
            system.run(() => sender.runCommand(`playsound random.break @s`));
            teleportCancelled = true;
            return;
        }

        if (countdown > 0) {
            sender.sendMessage(`§7[§b#§7] §aTeleporting in §e${countdown} §aseconds...`);
            system.run(() => sender.runCommand(`playsound note.hat @s`));
            countdown--;
            system.runTimeout(tick, 20);
        } else {
            if (!sender || !player) return;
            sender.teleport(player.location);
            sender.sendMessage("§7[§b#§7] §aYou have been teleported!");
            system.run(() => sender.runCommand(`playsound random.levelup @s`));
            system.run(() => player.runCommand(`playsound random.leveup @s`));
            system.run(() => sender.runCommand(`effect @s resistance 10 255 true`));
            system.run(() => player.runCommand(`effect @s resistance 10 255 true`));
            system.run(() => sender.runCommand(`effect @s weakness 10 255 true`));
            system.run(() => player.runCommand(`effect @s weakness 10 255 true`));
            delete playerRequest[player.id];
        }
    }

    tick();
}

export function declineTeleportRequest(player) {
    const request = playerRequest[player.id];
    if (!request) return player.sendMessage("§7[§b#§7] §cNo pending teleport requests.");
    
    const sender = world.getPlayers().find(p => p.id === request.sender);
    if (sender) sender.sendMessage(`§7[§b#§7] §e${player.name} §chas declined your teleport request.`);
    player.sendMessage("§7[§b#§7] §cTeleport request declined.");

    delete playerRequest[player.id];
}

export function showOutgoingRequests(player) {
    const outgoing = Object.values(playerRequest).filter(req => req.sender === player.id);
    if (!outgoing.length) return player.sendMessage("§7[§b#§7] §cNo outgoing requests.");

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §eOutgoing Requests")
        .body("Click a request to cancel:")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aBack", "textures/ui/arrow_left");

    outgoing.forEach(req => form.button(customFormUICodes.action.buttons.positions.main_only + `§cCancel request to §e${req.targetName}`, "textures/ui/icon_steve"));

    form.show(player).then((response) => {
        if (response.canceled || response.selection === 0) return showTeleportRequestForm(player);
        const selectedRequest = outgoing[response.selection - 1];

        if (selectedRequest) {
            delete playerRequest[selectedRequest.target];
            player.sendMessage(`§7[§b#§7] §cRequest to §e${selectedRequest.targetName} §ccanceled.`);
        }
    });
}

export function showIncomingRequests(player) {
    const incomingRequests = Object.values(playerRequest).filter(req => req.target === player.id);
    if (!incomingRequests.length) return player.sendMessage("§7[§b#§7] §cNo incoming requests.");

    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §fIncoming Requests")
        .body("Select a request to accept or decline:")
        .button(customFormUICodes.action.buttons.positions.main_only + "§aBack", "textures/ui/arrow_left");

    incomingRequests.forEach(req => form.button(customFormUICodes.action.buttons.positions.main_only + `§e${req.senderName}`, "textures/ui/icon_steve"));

    form.show(player).then((response) => {
        if (response.canceled || response.selection === 0) return showTeleportRequestForm(player);

        const selectedRequest = incomingRequests[response.selection - 1];
        if (!selectedRequest) return;

        showIncomingRequestAction(player, selectedRequest);
    });
}

function showIncomingRequestAction(player, request) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §fIncoming Request")
        .body(`§e${request.senderName} §ahas requested to teleport to you.`)
        .button(customFormUICodes.action.buttons.positions.main_only + "§aAccept", "textures/ui/confirm")
        .button(customFormUICodes.action.buttons.positions.main_only + "§cDecline", "textures/ui/cancel");

    form.show(player).then((response) => {
        if (response.canceled) return showIncomingRequests(player);
        if (response.selection === 0) acceptTeleportRequest(player);
        else declineTeleportRequest(player);
    });
}

function getTeleportToggleButton(player) {
    const isDisabled = tpablocks[player.id]?.includes("teleport_requests");
    return {
        text: `Toggle Teleport Requests\n§7[ ${isDisabled ? "§cDisabled" : "§aEnabled"} §7]`,
        icon: "textures/items/blaze_powder"
    };
}

export function toggleTeleportRequests(player) {
    if (!tpablocks[player.id]) tpablocks[player.id] = [];

    if (tpablocks[player.id].includes("teleport_requests")) {
        tpablocks[player.id] = tpablocks[player.id].filter(tag => tag !== "teleport_requests");
        player.sendMessage("§7[§b#§7] §aTeleport requests are now enabled.");
    } else {
        tpablocks[player.id].push("teleport_requests");
        player.sendMessage("§7[§b#§7] §cTeleport requests are now disabled.");
    }

    showTeleportRequestForm(player);
}

//
// Block and Unblock Functions
//

export function blockPlayer(player, target) {
    if (!tpablocks[player.id]) tpablocks[player.id] = [];
    if (tpablocks[player.id].includes(target.id)) {
        return player.sendMessage(`§7[§b#§7] §c${target.name} is already blocked.`);
    }

    tpablocks[player.id].push(target.id);
    player.sendMessage(`§7[§b#§7] §cYou have blocked §e${target.name}§c.`);
}

export function unblockPlayer(player, target) {
    if (!tpablocks[player.id] || !tpablocks[player.id].includes(target.id)) {
        return player.sendMessage(`§7[§b#§7] §c${target.name} is not blocked.`);
    }

    tpablocks[player.id] = tpablocks[player.id].filter(id => id !== target.id);
    player.sendMessage(`§7[§b#§7] §aYou have unblocked §e${target.name}§a.`);
}