/*
 * BlueMods AntiCheat Configuration
 * * * * * | * * * * * | * * * * * | * * * * * 
 * Description: You can Access and Edit this config file, but owning this is not allowed
*/

export const main = {
    prefix: "!", // Main Prefix
    adminTag: "admin",
    trustTag: "trusted",
    notifyTag: "notify",
    developer: "§b@bluemods.lol §7| §3https://dsc.gg/bluemods",
    bmversion: "§gBeta-v5.11.5",
    mcversion: "§g1.21.100 §7- §g1.21.101",
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
        "8Crafter",
        "Mehmet303j"
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
        "rtp": false,
        "help": true,
        "ping": true,
        "about": true,
        "warp": true,
        "home": false,
        "tpa": true,
        // Gamemodes
        "gma": true,
        "gmc": true,
        "gms": true,
        "gmsp": true,
        "vanish": true,
        // Staff Commands
        "kick": true,
        "ban": true,
        "cmdsf": true,
        "mute": true,
        "freeze": true,
        "lagclear": true,
        "give": true,
        "troll": true,
        "welcome": true,
        "banitem": true,
        "clearchat": true,
        "ecwipe": true,
        "invsee": true,
        "inwipe": true,
        "pearl": true,
        "chatdisplay": true,
        "rank": true,
        // Operator's Only
        "notify": true,
        "op": true,
        "trusted": true,
        // Development or Beta Testing
        "nbtload": false,
        "daily": false,
        "echest": false,
        "back": false,
        "compass": false,
        "floatingtext": true
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
        "receiveCompassOnJoin": false,
        "inCombatLogging": false,
        "rankDisplaySystem": false,
        "enchantmentCheck": true,
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
            name: "command.general.category",
            commands: [
                { text: `  §7- §a!rtp §7- §3`, description: "command.rtp.description" },
                { text: `  §7- §a!help §7- §3`, description: "command.help.description" },
                { text: `  §7- §a!ping §7- §3`, description: "command.ping.description" },
                { text: `  §7- §a!about §7- §3`, description: "command.about.description" },
                { text: `  §7- §a!warp §7- §3`, description: "command.warp.description" }
            ]
        },
        {
            name: "command.tpa.category",
            commands: [
                { text: `  §7- §a!tpa §asend §7<§eplayer§7> §7- §3`, description: "command.tpasend.description" },
                { text: `  §7- §a!tpa §aaccept §7- §3`, description: "command.tpaaccept.description" },
                { text: `  §7- §a!tpa §cdecline §7- §3`, description: "command.tpadecline.description" },
                { text: `  §7- §a!tpa §ccancel §7- §3`, description: "command.tpacancel.description" },
                { text: `  §7- §a!tpa §dblock §7<§eplayer§7> §7- §3`, description: "command.tpablock.description" },
                { text: `  §7- §a!tpa §dunblock §7<§eplayer§7> §7- §3`, description: "command.tpaunblock.description" }
            ]
        },
        {
            name: "command.home.category",
            commands: [
                { text: `  §7- §a!home tp §7<§ehome_name§7> §7- §3`, description: "command.home.description" },
                { text: `  §7- §a!home §7<§eset§7/§cremove§7> §7<§ehome_name§7> §7- §3`, description: "command.homeset.description" },
                { text: `  §7- §a!home list §7- §3`, description: "command.homelist.description" }
            ]
        }
    ],
    adminCategories: [
        {
            name: "command.general.category",
            commands: [
                { text: `  §7- §a!rtp §7- §3`, description: "command.rtp.description" },
                { text: `  §7- §a!help §7- §3`, description: "command.help.description" },
                { text: `  §7- §a!ping §7- §3`, description: "command.ping.description" },
                { text: `  §7- §a!about §7- §3`, description: "command.about.description" },
                { text: `  §7- §a!spawn §7- §3`, description: "command.spawn.description" },
                { text: `  §7- §a!warp §7- §3`, description: "command.warp.description" }
            ]
        },
        {
            name: "command.tpa.category",
            commands: [
                { text: `  §7- §a!tpa §asend §7<§eplayer§7> §7- §3`, description: "command.tpasend.description" },
                { text: `  §7- §a!tpa §aaccept §7- §3`, description: "command.tpaaccept.description" },
                { text: `  §7- §a!tpa §cdecline §7- §3`, description: "command.tpadecline.description" },
                { text: `  §7- §a!tpa §ccancel §7- §3`, description: "command.tpacancel.description" },
                { text: `  §7- §a!tpa §dblock §7<§eplayer§7> §7- §3`, description: "command.tpablock.description" },
                { text: `  §7- §a!tpa §dunblock §7<§eplayer§7> §7- §3`, description: "command.tpaunblock.description" }
            ]
        },
        {
            name: "command.home.category",
            commands: [
                { text: `  §7- §a!home tp §7<§ehome_name§7> §7- §3`, description: "command.home.description" },
                { text: `  §7- §a!home §7<§eset§7/§cremove§7> §7<§ehome_name§7> §7- §3`, description: "command.homeset.description" },
                { text: `  §7- §a!home list §7- §3`, description: "command.homelist.description" },
                { text: `  §7- §a!spawn §7- §3`, description: "command.spawn.description" },
                { text: `  §7- §a!rspawn §7- §3`, description: "command.rspawn.description" },
                { text: `  §7- §a!setspawn §7- §3`, description: "command.setspawn.description" }
            ]
        },
        {
            name: "command.gamemode.category",
            commands: [
                { text: `  §7- §a!gma §7<§eplayer§7> §7- §3`, description: "command.gmc.description" },
                { text: `  §7- §a!gmc §7<§eplayer§7> §7- §3`, description: "command.setspawn.description" },
                { text: `  §7- §a!gms §7<§eplayer§7> §7- §3`, description: "command.setspawn.description" },
                { text: `  §7- §a!gmsp §7<§eplayer§7> §7- §3`, description: "command.gmsp.description" },
                { text: `  §7- §a!vanish §7<§eplayer§7> §7- §3`, description: "command.vanish.description" }
            ]
        },
        {
            name: "command.gamemode.category",
            commands: [
                { text: `  §7- §a!kick §7<§eplayer§7> §7[§areason§7] §7- §3`, description: "command.kick.description" },
                { text: `  §7- §a!ban §aadd §7[§gduration§7] §7<§eplayer§7> §7[§areason§7] §7- §3`, description: "command.banadd.description" },
                { text: `  §7- §a!ban §cremove §7<§eplayer§7> §7- §3`, description: "command.banremove.description" },
                { text: `  §7- §a!ban list §7- §3`, description: "command.banlist.description" },
                { text: `  §7- §a!cmdsf §7<§aenable§7/§cdisable§7> §7- §3`, description: "command.cmdsf.description" },
                { text: `  §7- §a!mute §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3`, description: "command.mute.description" },
                { text: `  §7- §a!mute list §7- §3`, description: "command.mutelist.description" },
                { text: `  §7- §a!lagclear §7<§adefault§7/§amobs§7/§aall§7> §7- §3`, description: "command.lagclear.description" },
                { text: `  §7- §a!give §7<§aitem§7> §7<§evalue§7> [§edata§7] §7- §3`, description: "command.give.description" },
                { text: `  §7- §a!troll §7<§dtroll§7> §7<§eplayer§7> §7- §3`, description: "command.troll.description" },
                { text: `  §7- §a!banitem §7<§aadd§7/§cremove§7> §7<§aitem§7> §7- §3`, description: "command.banitem.description" },
                { text: `  §7- §a!banitem list §7- §3`, description: "command.banitemlist.description" },
                { text: `  §7- §a!clearchat §7- §3`, description: "command.clearchat.description" },
                { text: `  §7- §a!ecwipe §7<§eplayer§7> §7- §3`, description: "command.ecwipe.description" },
                { text: `  §7- §a!invsee §7<§eplayer§7> §7- §3`, description: "command.invsee.description" },
                { text: `  §7- §a!invwipe §7<§eplayer§7> §7- §3`, description: "command.invwipe.description" },
                { text: `  §7- §a!pearl §7<§gduration§7> §7- §3`, description: "command.pearl.description" },
                { text: `  §7- §a!rank §7<§aadd§7/§cremove§7> §7<§arank§7> §7[§gcolor§7] §7<§eplayer§7> §7- §3`, description: "command.rank.description" },
                { text: `  §7- §a!floatingtext §7<§atext§7> §7[§gx, y, z§7] - §3`, description: "command.floatingtext.description" }
            ]
        },
        {
            name: "command.operator.category",
            commands: [
                { text: `  §7- §a!op §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3`, description: "command.op.description" },
                { text: `  §7- §a!op list §7- §3`, description: "command.oplist.description" },
                { text: `  §7- §a!notify §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3`, description: "command.notify.description" },
                { text: `  §7- §a!notify list §7- §3`, description: "command.notifylist.description" },
                { text: `  §7- §a!trusted §7<§aadd§7/§cremove§7> §7<§eplayer§7> §7- §3`, description: "command.trusted.description" },
                { text: `  §7- §a!trusted list §7- §3`, description: "command.trustedlist.description" }
            ]
        },
        {
            name: "command.modules.category",
            commands: [
                { text: `  §7- §a!chatconfig §7<§aenable§7/§cdisable§7> §7<§6module§7> §7- §3`, description: "command.chatconfig.description" },
                { text: `  §7- §a!chatconfig §7<§eset§7> §7<§6module§7> §7<§6integerValue§7> §7- §3`, description: "command.chatconfigset.description" },
                { text: `  §7- §a!chatconfig list §7- §3`, description: "command.chatconfiglist.description" },
                { text: `  §7- §a!cmdtoggle §7<§aenable§7/§cdisable§7> <§acommand§7> §7- §3`, description: "command.cmdtoggle.description" },
                { text: `  §7- §a!cmdtoggle list §7- §3`, description: "command.cmdtogglelist.description" },
                { text: `  §7- §a!chatdisplay §7<§eset§7/§cremove§7> §7<§achatstyle§7> §7- §3`, description: "command.chatdisplayset.description" },
                { text: `  §7- §a!chatdisplay §7<§aenable§7/§cdisable§7> §7- §3`, description: "command.chatdisplay.description" },
                { text: `  §7- §a!welcome §7<§ajoin§7/§cleave§7> §7<§eset§7/§cremove§7> §7[§atext§7] §7- §3`, description: "command.welcome.description" }
            ]
        }
    ]
};

export default main;
