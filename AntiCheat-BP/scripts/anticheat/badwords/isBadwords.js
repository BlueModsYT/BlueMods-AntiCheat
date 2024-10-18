import { world } from "@minecraft/server";
import { badWords } from "./config.js";

const badWordCount = new Map();

function containsBadWords(message) {
    const lowerCaseMessage = message.toLowerCase();
    return badWords.some(badWord => lowerCaseMessage.includes(badWord));
}

function checkForBadWords(data) {
    const playerName = data.sender.name;
    
    if (containsBadWords(data.message)) {
        data.cancel = true;

        let count = badWordCount.get(playerName) || 0;
        count += 1;
        badWordCount.set(playerName, count);

        if (count >= 3) {
            data.sender.sendMessage(`§7[§b#§7] §cYou have been kicked for using inappropriate language.`);
            world.getDimension('overworld').runCommandAsync(`kick "${playerName}" Inappropriate language`);
            badWordCount.delete(playerName); // Reset the count after kicking
        } else {
            data.sender.sendMessage(`§7[§b#§7] §cPlease refrain from using inappropriate language. Warning: ${count}/3.`);
            data.sender.runCommandAsync(`playsound random.break @s`);
        }
    }
}

world.beforeEvents.chatSend.subscribe((data) => {
    if (!data.message.startsWith("!")) {
        checkForBadWords(data);
    }
});
          
