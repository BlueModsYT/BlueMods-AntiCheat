import { translate } from "../translations.js";

export const main = {
    prefix: "!",
    adminTag: "admin",
    trustTag: "trusted",
    notifyTag: "notify",
    developer: "§b@bluemods.lol §7| §3https://dsc.gg/bluemods",
    bmversion: "§gBeta-v5.8.10",
    mcversion: "§g1.21.70 §7- §g1.21.72",
    bmdescription: "§3BlueMods AntiCheat for Minecraft Bedrock is a powerful tool designed to protect your server from hackers & cheaters.",
    player: "§7<§eplayer§7>",
    reason: "§7[§areason§7]",
    valuedata: "§7<§evalue§7> [§edata§7]",
    addremove: "§7<§aadd§7/§cremove§7>",
    enabledisable: "§7<§aenable§7/§cdisable§7>",
    enabledCommandsKey: "enabledCommands",
    bluemods: [
        "BlueShadow",
        "Trokkk",
        "MP09",
        "8Crafter"
    ],
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
        "!nbtload": false,
        "!daily": false,
        "!echest": false,
        "!back": false,
        "!language": false,
        "!compass": false,
        // Development or Beta Testing
        "!floatingtext": true
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
        "rankDisplaySystem": false,
        "loredItemCheck": true,
        "dangerItemCheck": true,
        "operatorItemCheck": true,
        "eggItemCheck": true,
        "unknownItemCheck": true,
        "nameSpoofCheck": true,
        "nbtItemCheck": true,
        "isAgentMob": true,
        "isCommandBlockMinecart": true,
        "isNPCMob": false,
        "isCreativeMode": false
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
                `§7> §a!rtp §7- §3${translate("command.rtp.description")}`,
                `§7> §a!help §7- §3${translate("command.help.description")}`,
                `§7> §a!ping §7- §3${translate("command.ping.description")}`,
                `§7> §a!about §7- §3${translate("command.about.description")}`,
                `§7> §a!spawn §7- §3${translate("command.spawn.description")}`
            ]
        },
        {
            name: "TPA Commands",
            commands: [
                `§7> §a!tpa §asend §7<§eplayer§7> §7- §3${translate("command.tpasend.description")}`,
                `§7> §a!tpa §aaccept §7- §3${translate("command.tpaaccept.description")}`,
                `§7> §a!tpa §cdecline §7- §3${translate("command.tpadecline.description")}`,
                `§7> §a!tpa §ccancel §7- §3${translate("command.tpacancel.description")}`,
                `§7> §a!tpa §dblock §7<§eplayer§7> §7- §3${translate("command.tpablock.description")}`,
                `§7> §a!tpa §dunblock §7<§eplayer§7> §7- §3${translate("command.tpaunblock.description")}`
            ]
        },
        {
            name: "Home Commands",
            commands: [
                `§7> §a!home tp §7<§ehome_name§7> §7- §3${translate("command.home.description")}`,
                `§7> §a!home §7<§eset§7/§cremove§7> §7<§ehome_name§7> §7- §3${translate("command.homeset.description")}`,
                `§7> §a!home list §7- §3${translate("command.homelist.description")}`
            ]
        }
    ],
    adminCategories: [
        {
            name: "General Commands",
            commands: [
                `§7> §a!rtp §7- §3${translate("command.rtp.description")}`,
                `§7> §a!help §7- §3${translate("command.help.description")}`,
                `§7> §a!ping §7- §3${translate("command.ping.description")}`,
                `§7> §a!about §7- §3${translate("command.about.description")}`,
                `§7> §a!spawn §7- §3${translate("command.spawn.description")}`
            ]
        },
        {
            name: "TPA Commands",
            commands: [
                `§7> §a!tpa §asend §7<§eplayer§7> §7- §3${translate("command.tpasend.description")}`,
                `§7> §a!tpa §aaccept §7- §3${translate("command.tpaaccept.description")}`,
                `§7> §a!tpa §cdecline §7- §3${translate("command.tpadecline.description")}`,
                `§7> §a!tpa §ccancel §7- §3${translate("command.tpacancel.description")}`,
                `§7> §a!tpa §dblock §7<§eplayer§7> §7- §3${translate("command.tpablock.description")}`,
                `§7> §a!tpa §dunblock §7<§eplayer§7> §7- §3${translate("command.tpaunblock.description")}`
            ]
        },
        {
            name: "Home Commands",
            commands: [
                `§7> §a!home tp §7<§ehome_name§7> §7- §3${translate("command.home.description")}`,
                `§7> §a!home §7<§eset§7/§cremove§7> §7<§ehome_name§7> §7- §3${translate("command.homeset.description")}`,
                `§7> §a!home list §7- §3${translate("command.homelist.description")}\n`,
                `§7> §a!spawn §7- §3${translate("command.spawn.description")}`,
                `§7> §a!rspawn §7- §3${translate("command.rspawn.description")}`,
                `§7> §a!setspawn §7- §3${translate("command.setspawn.description")}`
            ]
        },
        {
            name: "Gamemode Commands",
            commands: [
                `§7> §a!gma §7<§eplayer§7> §7- §3${translate("command.gma.description")}`,
                `§7> §a!gmc §7<§eplayer§7> §7- §3${translate("command.gmc.description")}`,
                `§7> §a!gms §7<§eplayer§7> §7- §3${translate("command.gms.description")}`,
                `§7> §a!gmsp §7<§eplayer§7> §7- §3${translate("command.gmsp.description")}`,
                `§7> §a!vanish §7<§eplayer§7> §7- §3${translate("command.vanish.description")}`
            ]
        },
        {
            name: "Moderation Commands",
            commands: [
                `§7> §a!kick §7<§eplayer§7> §7[§areason§7] §7- §3${translate("command.kick.description")}`,
                `§7> §a!ban §aadd §7[§gduration§7] §7<§eplayer§7> §7[§areason§7] §7- §3${translate("command.banadd.description")}`,
                `§7> §a!ban §cremove §7<§eplayer§7> §7- §3${translate("command.banremove.description")}`,
                `§7> §a!ban list §7- §3${translate("command.banlist.description")}`,
                `§7> §a!cmdsf §7<§aenable§7/§cdisable§7> §7- §3${translate("command.cmdsf.description")}`,
                `§7> §a!mute §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3${translate("command.mute.description")}`,
                `§7> §a!mute list §7- §3${translate("command.mutelist.description")}`,
                `§7> §a!freeze §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3${translate("command.freeze.description")}`,
                `§7> §a!freeze list §7- §3${translate("command.freezelist.description")}`,
                `§7> §a!lagclear §7<§adefault§7/§amobs§7/§aall§7> §7- §3${translate("command.lagclear.description")}`,
                `§7> §a!give §7<§aitem§7> §7<§evalue§7> [§edata§7] §7- §3${translate("command.give.description")}`,
                `§7> §a!troll §7<§dtroll§7> §7<§eplayer§7> §7- §3${translate("command.troll.description")}`,
                `§7> §a!welcome §7<§ajoin§7/§cleave§7> §7<§eset§7/§cremove§7> §7[§atext§7] §7- §3${translate("command.welcome.description")}`,
                `§7> §a!banitem §7<§aadd§7/§cremove§7> §7<§aitem§7> §7- §3${translate("command.banitem.description")}`,
                `§7> §a!banitem list §7- §3${translate("command.banitemlist.description")}`,
                `§7> §a!clearchat §7- §3${translate("command.clearchat.description")}`,
                `§7> §a!ecwipe §7<§eplayer§7> §7- §3${translate("command.ecwipe.description")}`,
                `§7> §a!invsee §7<§eplayer§7> §7- §3${translate("command.invsee.description")}`,
                `§7> §a!invwipe §7<§eplayer§7> §7- §3${translate("command.invwipe.description")}`,
                `§7> §a!cmdtoggle §7<§aenable§7/§cdisable§7> <§acommand§7> §7- §3${translate("command.cmdtoggle.description")}`,
                `§7> §a!cmdtoggle list §7- §3${translate("command.cmdtogglelist.description")}`,
                `§7> §a!pearl §7<§gduration§7> §7- §3${translate("command.pearl.description")}`,
                `§7> §a!chatdisplay §7<§eset§7/§cremove§7> §7<§achatstyle§7> §7- §3${translate("command.chatdisplayset.description")}`,
                `§7> §a!chatdisplay §7<§aenable§7/§cdisable§7> §7- §3${translate("command.chatdisplay.description")}`,
                `§7> §a!rank §7<§aadd§7/§cremove§7> §7<§arank§7> §7[§gcolor§7] §7<§eplayer§7> §7- §3${translate("command.rank.description")}`,
                `§7> §a!chatconfig §7<§aenable§7/§cdisable§7> §7<§6module§7> §7- §3${translate("command.chatconfig.description")}`,
                `§7> §a!chatconfig §7<§eset§7> §7<§6module§7> §7<§6integerValue§7> §7- §3${translate("command.chatconfigset.description")}`,
                `§7> §a!chatconfig list §7- §3${translate("command.chatconfiglist.description")}`,
                `§7> §a!floatingtext §7<§atext§7> §7[§gx, y, z§7] - §3${translate("command.floatingtext.description")}`
            ]
        },
        {
            name: "Operator Commands",
            commands: [
                `§7> §a!op §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3${translate("command.op.description")}`,
                `§7> §a!op list §7- §3${translate("command.oplist.description")}`,
                `§7> §a!notify §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3${translate("command.notify.description")}`,
                `§7> §a!notify list §7- §3${translate("command.notifylist.description")}`,
                `§7> §a!trusted §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3${translate("command.trusted.description")}`,
                `§7> §a!trusted list §7- §3${translate("command.trustedlist.description")}`
            ]
        }
    ]
};

export default main;