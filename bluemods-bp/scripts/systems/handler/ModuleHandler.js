import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { showCompassUI, DailyRewardsPanel } from "../../chat/playerCompass.js";
import { customFormUICodes } from "../../ui/customFormUICodes.js";
import main from "../../commands/config.js";

const DAILY_REWARDS_KEY = "dailyRewards";
let dailyRewards = [];

const DAILY_COOLDOWN_KEY = "dailyCooldown";
const DAILY_COOLDOWN_TIME_KEY = "dailyCooldownTime";
let dailyCooldownTime = 12 * 60 * 60 * 1000;

system.run(() => {
    const storedCooldownTime = world.getDynamicProperty(DAILY_COOLDOWN_TIME_KEY);
    if (storedCooldownTime) {
        dailyCooldownTime = storedCooldownTime;
    }

    const storedDailyRewards = world.getDynamicProperty(DAILY_REWARDS_KEY);
    if (!storedDailyRewards) {
        dailyRewards = main.daily;
        world.setDynamicProperty(DAILY_REWARDS_KEY, JSON.stringify(dailyRewards));
    } else {
        dailyRewards = JSON.parse(storedDailyRewards);
    }
});

export function setDailyCooldownTime(timeInMilliseconds) {
    dailyCooldownTime = timeInMilliseconds;
    world.setDynamicProperty(DAILY_COOLDOWN_TIME_KEY, dailyCooldownTime);
}

export function getRemainingCooldownTime(player) {
    const playerKey = `${player.id}:${DAILY_COOLDOWN_KEY}`;
    const lastClaimTime = world.getDynamicProperty(playerKey);
    const currentTime = Date.now();

    if (!lastClaimTime) return 0;

    const remainingTime = dailyCooldownTime - (currentTime - lastClaimTime);
    return remainingTime > 0 ? remainingTime : 0;
}

const FALLBACK_TEXTURE = "textures/ui/icon_book_writable";

function saveDailyRewards() {
    world.setDynamicProperty(DAILY_REWARDS_KEY, JSON.stringify(dailyRewards));
}

export function ViewRewardsPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aView Rewards")
        .body("§7Current daily rewards:");

    dailyRewards.forEach((reward, index) => {
        const rewardText = `§e${reward.count}x ${reward.item} §7(§a${reward.chance}% Chance§7)`;
        const itemTexture = `textures/items/${reward.item}`;

        form.button(customFormUICodes.action.buttons.positions.main_only + rewardText, itemTexture || FALLBACK_TEXTURE);
    });

    form.button(customFormUICodes.action.buttons.positions.title_bar_only + "Back", "textures/ui/arrow_left");
    form.button(customFormUICodes.action.buttons.positions.title_bar_only + "Close", "textures/ui/cancel");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === dailyRewards.length + 1) return;

        if (response.selection === dailyRewards.length) {
            DailyRewardsPanel(player);
        }
    }).catch((error) => {
        console.error("Failed to show view rewards panel:", error);
    });
}

export function AddRewardPanel(player) {
    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §aAdd Reward")
        .textField("Item Name", "Enter the item name (e.g., diamond, stick, etc.)")
        .slider("Count", 1, 64, 1, 1)
        .slider("Chance (%)", 1, 100, 1, 50);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [itemName, count, chance] = response.formValues;

        if (!itemName || itemName.trim() === "") {
            player.sendMessage("§7[§c-§7] §cItem name cannot be empty.");
            system.run(() => player.runCommand("playsound random.break @s"));
            return;
        }

        const newReward = { item: itemName.trim(), count, chance };

        dailyRewards.push(newReward);
        saveDailyRewards();

        player.sendMessage(`§7[§b#§7] §aAdded reward: §e${count}x ${itemName} §7(§a${chance}% Chance§7)`);
        system.run(() => player.runCommand("playsound note.bell @s"));

        DailyRewardsPanel(player);
    }).catch((error) => {
        console.error("Failed to show add reward panel:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while adding the reward.");
    });
}

export function RemoveRewardPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §cRemove Reward")
        .body("§7Select a reward to remove:");

    dailyRewards.forEach((reward, index) => {
        const rewardText = `§e${reward.count}x ${reward.item} §7(§a${reward.chance}% Chance§7)`;
        const itemTexture = `textures/items/${reward.item}`;

        form.button(customFormUICodes.action.buttons.positions.main_only + rewardText, itemTexture || FALLBACK_TEXTURE);
    });

    form.button(customFormUICodes.action.buttons.positions.title_bar_only + "Back", "textures/ui/arrow_left");
    form.button(customFormUICodes.action.buttons.positions.title_bar_only + "Close", "textures/ui/cancel");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === dailyRewards.length + 1) return;

        if (response.selection === dailyRewards.length) {
            DailyRewardsPanel(player);
            return;
        }

        const removedReward = dailyRewards.splice(response.selection, 1)[0];
        saveDailyRewards();

        player.sendMessage(`§7[§b#§7] §cRemoved reward: §e${removedReward.count}x ${removedReward.item} §7(§a${removedReward.chance}% Chance§7)`);
        system.run(() => player.runCommand("playsound random.break @s"));

        RemoveRewardPanel(player);
    }).catch((error) => {
        console.error("Failed to show remove reward panel:", error);
    });
}

export function EditRewardPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §eEdit Reward")
        .body("§7Select a reward to edit:");

    dailyRewards.forEach((reward, index) => {
        const rewardText = `§e${reward.count}x ${reward.item} §7(§a${reward.chance}% Chance§7)`;
        const itemTexture = `textures/items/${reward.item}`;

        form.button(customFormUICodes.action.buttons.positions.main_only + rewardText, itemTexture || FALLBACK_TEXTURE);
    });

    form.button(customFormUICodes.action.buttons.positions.title_bar_only + "Back", "textures/ui/arrow_left");
    form.button(customFormUICodes.action.buttons.positions.title_bar_only + "Close", "textures/ui/cancel");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === dailyRewards.length + 1) return;

        if (response.selection === dailyRewards.length) {
            DailyRewardsPanel(player);
            return;
        }

        const selectedReward = dailyRewards[response.selection];
        EditRewardForm(player, selectedReward, response.selection);
    }).catch((error) => {
        console.error("Failed to show edit reward panel:", error);
    });
}

export function EditRewardForm(player, reward, index) {
    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §eEdit Reward")
        .textField("Item Name", "Enter the item name (e.g., diamond, stick, etc.)", reward.item)
        .slider("Count", 1, 64, 1, reward.count)
        .slider("Chance (%)", 1, 100, 1, reward.chance);

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [itemName, count, chance] = response.formValues;

        if (!itemName || itemName.trim() === "") {
            player.sendMessage("§7[§c-§7] §cItem name cannot be empty.");
            system.run(() => player.runCommand("playsound random.break @s"));
            return;
        }

        dailyRewards[index] = { item: itemName.trim(), count, chance };
        saveDailyRewards();

        player.sendMessage(`§7[§b#§7] §aUpdated reward: §e${count}x ${itemName} §7(§a${chance}% Chance§7)`);
        system.run(() => player.runCommand("playsound note.bell @s"));

        EditRewardPanel(player);
    }).catch((error) => {
        console.error("Failed to show edit reward form:", error);
    });
}

export function CustomCooldownPanel(player) {
    const form = new ModalFormData()
        .title("§l§bBlueMods §7| §aCustom Cooldown")
        .textField("Cooldown Time", "Enter cooldown time (e.g., 10s, 1h, 30m, 2d)");

    form.show(player).then((response) => {
        if (response.canceled) return;

        const [cooldownInput] = response.formValues;

        const timeValue = parseCooldownInput(cooldownInput);

        if (timeValue === null) {
            player.sendMessage("§7[§c-§7] §cInvalid cooldown format. Use '10s', '1h', '30m', or '2d'.");
            system.run(() => player.runCommand("playsound random.break @s"));
            return;
        }

        setDailyCooldownTime(timeValue);

        player.sendMessage(`§7[§b#§7] §aDaily cooldown time set to §e${cooldownInput}§a.`);
        system.run(() => player.runCommand("playsound note.bell @s"));

        DailyRewardsPanel(player);
    }).catch((error) => {
        console.error("Failed to show custom cooldown panel:", error);
        player.sendMessage("§7[§c-§7] §cAn error occurred while setting the cooldown time.");
    });
}

function parseCooldownInput(input) {
    const regex = /^(\d+)(s|m|h|d)$/i;
    const match = input.match(regex);

    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        case "d":
            return value * 24 * 60 * 60 * 1000;
        default:
            return null;
    }
}
