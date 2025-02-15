export const main = {
    prefix: "!",
    adminTag: "admin",
    trustTag: "trusted",
    notifyTag: "notify",
    developer: "§b@bluemods.lol §7| §3https://dsc.gg/bluemods",
    bmversion: "§gBeta-v5.7.0",
    mcversion: "§g1.21.50 §7- §g1.21.51",
    bmdescription: "§3BlueMods Essential – A command-based utility designed to enhance gameplay and provide basic prevention measures for realms and servers.",
    enabledCommandsKey: "enabledCommands",
    colors: {
        black: "§0",
        dark_blue: "§1",
        dark_green: "§2",
        dark_aqua: "§3",
        dark_red: "§4",
        dark_purple: "§5",
        gold: "§6",
        gray: "§7",
        dark_gray: "§8",
        blue: "§9",
        green: "§a",
        aqua: "§b",
        red: "§c",
        light_purple: "§d",
        yellow: "§e",
        white: "§f"
    },
    enabledCommands: {
        // General Commands
        "!rtp": false,
        "!help": true,
        "!ping": true,
        "!about": true,
        //"!spawn": true,
        "!home": false,
        "!tpa": true,
        // Gamemodes
        "!gma": true,
        "!gmc": true,
        "!gms": true,
        "!gmsp": true,
        "!vanish": true,
        // Staff Commands
        "!kick": true,
        "!ban": true,
        "!cmdsf": true,
        "!mute": true,
        "!freeze": true,
        "!lagclear": true,
        "!give": true,
        "!troll": true,
        "!welcome": true,
        "!banitem": true,
        "!clearchat": true,
        "!ecwipe": true,
        "!invsee": true,
        "!inwipe": true,
        "!pearl": true,
        "!chatdisplay": true,
        "!rank": true,
        // Operator's Only
        "!notify": true,
        "!op": true,
        "!trusted": true,
        // Development or Beta Testing
        "!incombat": false,
        "!nbtload": false,
        "!daily": false,
        "!echest": false
    },
    daily: [
        { item: "book", count: 2, chance: 50 },
        { item: "stick", count: 5, chance: 50 },
        { item: "coal", count: 3, chance: 50 },
        { item: "redstone", count: 1, chance: 30 },
        { item: "iron_ingot", count: 2, chance: 30 },
        { item: "gold_ingot", count: 2, chance: 30 },
        { item: "emerald", count: 2, chance: 25 },
        { item: "lapis_lazuli", count: 5, chance: 25 },
        { item: "netherite_scrap", count: 4, chance: 10 },
        { item: "diamond", count: 5, chance: 5 },
        { item: "netherite_ingot", count: 3, chance: 5 }
    ],
    moduleStates: {
        "dangerItemCheck": true,
        "operatorItemCheck": true,
        "eggItemCheck": true,
        "unknownItemCheck": true
    },
    chatConfig: {
        "SPAM_COOLDOWN_TIME": 5000,
        "allowDuplicateMessages": false,
        "allowBadWords": false,
        "allowSpam": false
    },
    memberCategories: [
        {
            name: "General Commands",
            commands: [
                "§7> §a!rtp §7- §3allows you to teleport on random location.",
                "§7> §a!help §7- §3shows the list of the commands.",
                "§7> §a!ping §7- §3show the world's tps and ping.",
                "§7> §a!about §7- §3shows the developer of the addon.",
                "§7> §a!spawn §7- §3go back to lobby."
            ]
        },
        {
            name: "TPA Commands",
            commands: [
                "§7> §a!tpa §asend §7<§eplayer§7> §7- §3allows you to request a teleport from any players.",
                "§7> §a!tpa §aaccept §7- §3allows you to accept a current request from other player.",
                "§7> §a!tpa §cdecline §7- §3you can only decline a request from other player.",
                "§7> §a!tpa §ccancel §7- §3you can cancel a request from the player.",
                "§7> §a!tpa §dblock §7<§eplayer§7> §7- §3allows you to block a player from sending a teleport request.",
                "§7> §a!tpa §dunblock §7<§eplayer§7> §7- §3unblock the blocked player so they can able to send a request to you again."
            ]
        },
        {
            name: "Home Commands",
            commands: [
                "§7> §a!home tp §7<§ehome_name§7> §7- §3teleport to your existing set home.",
                "§7> §a!home §7<§eset§7/§cremove§7> §7<§ehome_name§7> §7- §3set a home or remove it.",
                "§7> §a!home list §7- §3see the list of your created homes."
            ]
        }
    ],
    adminCategories: [
        {
            name: "General Commands",
            commands: [
                "§7> §a!rtp §7- §3allows you to teleport on random location.",
                "§7> §a!help §7- §3shows the list of the commands.",
                "§7> §a!ping §7- §3show the world's tps and ping.",
                "§7> §a!about §7- §3shows the developer of the addon.",
                "§7> §a!spawn §7- §3go back to lobby."
            ]
        },
        {
            name: "TPA Commands",
            commands: [
                "§7> §a!tpa §asend §7<§eplayer§7> §7- §3allows you to request a teleport from any players.",
                "§7> §a!tpa §aaccept §7- §3allows you to accept a current request from other player.",
                "§7> §a!tpa §cdecline §7- §3you can only decline a request from other player.",
                "§7> §a!tpa §ccancel §7- §3you can cancel a request from the player.",
                "§7> §a!tpa §dblock §7<§eplayer§7> §7- §3allows you to block a player from sending a teleport request.",
                "§7> §a!tpa §dunblock §7<§eplayer§7> §7- §3unblock the blocked player so they can able to send a request to you again."
            ]
        },
        {
            name: "Home Commands",
            commands: [
                "§7> §a!home tp §7<§ehome_name§7> §7- §3teleport to your existing set home.",
                "§7> §a!home §7<§eset§7/§cremove§7> §7<§ehome_name§7> §7- §3set a home or remove it.",
                "§7> §a!home list §7- §3see the list of your created homes."
            ]
        },
        {
            name: "Gamemode Commands",
            commands: [
                "§7> §a!gma §7<§eplayer§7> §7- §3change gamemode to adventure.",
                "§7> §a!gmc §7<§eplayer§7> §7- §3change gamemode to creative.",
                "§7> §a!gms §7<§eplayer§7> §7- §3change gamemode to survival.",
                "§7> §a!gmsp §7<§eplayer§7> §7- §3change gamemode to spectator.",
                "§7> §a!vanish §7<§eplayer§7> §7- §3makes yourself invisibility."
            ]
        },
        {
            name: "Moderation Commands",
            commands: [
                "§7> §a!kick §7<§eplayer§7> §7[§areason§7] §7- §3kick a specific player in server.",
                "§7> §a!ban §aadd §7[§gduration§7] §7<§eplayer§7> §7[§areason§7] §7- §3ban a specific player in server.",
                "§7> §a!ban §cremove §7<§eplayer§7> §7- §3unban a specific player in server.",
                "§7> §a!ban list §7- §3see the list of the banned players on the server.",
                "§7> §a!cmdsf §7<§aenable§7/§cdisable§7> §7- §3disabled command block logs and popping on chats. §7[§aMODULE§7]",
                "§7> §a!mute §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3mute a specific player in server.",
                "§7> §a!mute list §7- §3see the list of muted user.",
                "§7> §a!freeze §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3freeze a specific player.",
                "§7> §a!freeze list §7- §3see the list of freezed user.",
                "§7> §a!lagclear §7<§adefault§7/§amobs§7/§aall§7> §7- §3kill all items on the ground.",
                "§7> §a!give §7<§aitem§7> §7<§evalue§7> [§edata§7] §7- §3give yourself an item(s).",
                "§7> §a!troll §7<§dtroll§7> §7<§eplayer§7> §7- §3troll someone in the server.",
                "§7> §a!welcome §7<§ajoin§7/§cleave§7> §7<§eset§7/§cremove§7> §7[§atext§7] §7- §3add or remove specific set text.",
                "§7> §a!banitem §7<§aadd§7/§cremove§7> §7<§aitem§7> §7- §3add or remove ban items.",
                "§7> §a!banitem list §7- §3see the list of banned.",
                "§7> §a!clearchat §7- §3clear your chat (only you can see it)",
                "§7> §a!ecwipe §7<§eplayer§7> §7- §3allows you to remove items on their ender_chest.",
                "§7> §a!invsee §7<§eplayer§7> §7- §3allows you to see other player(s) Inventory.",
                "§7> §a!invwipe §7<§eplayer§7> §7- §3this will clear the player(s) inventory.",
                "§7> §a!cmdtoggle §7<§aenable§7/§cdisable§7> <§acommand§7> §7- §3allows you to enable or disable a command. §7[§aMODULE§7]",
                "§7> §a!cmdtoggle list §7- §3see the list of commands module.",
                "§7> §a!pearl §7<§gduration§7> §7- §3change ender pearl cooldown.",
                "§7> §a!chatdisplay §7<§eset§7/§cremove§7> §7<§achatstyle§7> §7- §3change the style of the player's chat.",
                "§7> §a!chatdisplay §7<§aenable§7/§cdisable§7> §7- §3enable or disable the chatdisplay into default mojang chat. §7[§aMODULE§7]",
                "§7> §a!rank §7<§aadd§7/§cremove§7> §7<§arank§7> §7[§gcolor§7] §7<§eplayer§7> §7- §3add rank(s) to player.",
                "§7> §a!chatconfig §7<§aenable§7/§cdisable§7> §7<§6module§7> §7- §3enable or disable a boolean chat configuration option.",
                "§7> §a!chatconfig §7<§eset§7> §7<§6module§7> §7<§6integerValue§7> §7- §3set the value of an integer chat configuration option.",
                "§7> §a!chatconfig list §7- §3see the list of available chat configuration options.",
                "§7> §a!module §7<§aenable§7/§cdisable§7/§6list§7> §7[§6module§7]"
            ]
        },
        {
            name: "Operator Commands",
            commands: [
                "§7> §a!op §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3op a specific player in server to immune to any anticheat.",
                "§7> §a!op list §7- §3see the list of the admins on the anticheat.",
                "§7> §a!notify §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3notification when someone got flagged by the anticheat.",
                "§7> §a!notify list §7- §3see the list of the notify on the anticheat.",
                "§7> §a!trusted §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3add trusted or remove on specific player.",
                "§7> §a!trusted list §7- §3see the list of the trusted on the anticheat."
            ]
        }
    ]
};

export default main;
