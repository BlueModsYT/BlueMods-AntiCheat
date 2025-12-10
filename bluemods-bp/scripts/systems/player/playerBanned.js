import { world, system } from "@minecraft/server";

//░███░░██░░██░░█░████░██░░██░░████░░████░░░███░
//░█░░█░█░░░░█░░█░█░░░░██░░██░█░░░█░░█░░░█░█░░█░
//░███░░█░░░░█░░█░███░░██░░██░█░░░░█░█░░░█░██░░░
//░█░░█░█░░░░█░░█░█░░░░█░██░█░█░░░░█░█░░░█░░░█░░
//░█░░█░█░░█░█░░█░█░░█░█░██░█░█░░░█░░█░░░█░█░░█░
//░███░░████░███░░████░█░█░░█░░███░░░████░░███░░
// https://dsc.gg/bluemods

const BANNED_PLAYERS = [
    "Adgods", "Aleximont", "AltAnormalOM", "Aliveland419563", "Alphastorm9471",
    "Anderycarim", "AntonioPROKirby", "ARASR8260", "ARASR8262", "ArisenKitten455",
    "Ashoffici4l", "astolfoDev2", "A35435", "Ayxet", "azxpert", "BananaEater88",
    "BeadiXBL", "BeamAloneTH", "Beast89900", "BIGBOY6914", "BionicBen1218",
    "Bluefire5975", "BrendonBone mod", "Cacadoodledoo1", "capnes", "CarltonRBX",
    "CausableGem385", "CLOWNED ROFL", "Crazygamer", "CRYPT Night54", "Ctrlaltf44",
    "CubicalCoyote75", "CupsofNoss1628", "DARKELEMENT3998", "Dark Shad0w2564",
    "DarkerxLegend", "Daqiv", "Destroyer C00L", "Diamondboi10718", "DIG Doogie",
    "DigBick_rooster", "dio brand0w0159", "DeeJayTeeeeee", "dustyfrxg", "Echovite9835",
    "Economydev", "Egg7869", "ERMWHATTH3SlGMA", "Fairplay v4", "fatmole", "FlipperGraph703",
    "FoozoiNYC", "FrastionPVP", "Fuwzar", "frickyea99", "Gamerplygin", "Geiusici",
    "GingerHarp41307", "gingerfrog79175", "GravityBot", "Greed13376174", "grimleans",
    "helloagain7522", "HostingEconomy", "HumanShoe397800", "Hy4per2", "iamShadowLink",
    "Iceecoal", "igorrites26164", "ImNotHacking476", "Infernogod4473", "ISHAAN GAMER723",
    "JAMtoo2oof", "Japan60I6", "Jaydoglsc", "Julisco21", "JumboCanvas9718", "Justin TP2007",
    "kqac", "Kingkarter8013", "KingLeo332", "KebabNerdTog", "LOLSTARBURST", "LeasingAsp16479",
    "LyricTrain02895", "MasterAlt", "Maze luvs ramen", "MCharizard", "mello6894", "merthackers",
    "MexicanDream286", "mirbrahin", "MockEKRem", "MoreFerret5696", "Mr pro Gamer", "Mujalistic",
    "Nebula factions", "NicktrosGaming", "Nic The Punk", "Night8515", "ninjabals360",
    "NinjaXhunter130", "NotProovyPlays", "Nun Souls", "obaqlikesmen", "OIlllIIlIIlO", "PAKGAMER5451",
    "PAKGAMER54599", "Panda PlayZ3093", "Paralusive", "Pepegamessk", "PianoPandora948", "pinguintod482",
    "potatoes3348", "p2w crasher7754", "POPB0B 2B2T", "PriorElk6357949", "Progamer", "Qsa static",
    "QuandaleDGNGLE", "R2Rappy", "R2Rappy123", "RandomYTvideos", "realherobrine73", "RealmPlusAC",
    "RedRobotboom", "RedUplif", "RestiveHawk2905", "RubenThePig3818", "RushinBDev", "S4D3 galaxy",
    "Samdesap", "sandshrew81", "Savourywan", "ScareKoala49114", "SEBA7321", "SevenCactus132",
    "ShrekSMP", "Sithlordsoth", "Skullkid7800", "SlappsKing", "SlmplyLogicPvP", "slimesalt",
    "Spartan 4261400", "Spanishick9762", "starthree477738", "STARKILLER", "Starman12443",
    "Sweetdream2you", "Tarouc", "The Supreme Dub", "TheKingPengu", "thtbaconguy1029",
    "timmy_is_daddy57", "Toez6658", "Toxic1320", "TSL CLAN ON TOP", "Tubaexperte5221",
    "TudouFan", "ttv ncps bn", "UhWhatTheSigma", "unbatedDegree55", "UrgentTrash7032",
    "VolantSubset630", "WarLord42487", "WeddedStar4339", "WellWeb35431416", "WieldyAtol86717",
    "winniezapoo", "woffelz179", "Worrer", "Xbox Realm l", "Xraiddahitta", "XxWxsyxX",
    "Yusatc", "ZPOLSKI5079"
];

function isPlayerBanned(playerName) {
    return BANNED_PLAYERS.some(bannedName =>
        bannedName.toLowerCase() === playerName.toLowerCase()
    );
}

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    
    if (isPlayerBanned(player.name)) {
        player.addTag("ban_database");
        
        world.sendMessage(`§7[§aGlobal§7] §e${player.name} §ahas been permanently banned by §bBlueMods §eDatabase.`);
        system.run(() => player.runCommand('playsound note.bell @a'));
        
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§d#§7] §e${player.name} §chas attempted to join but is banned.`);
            system.run(() => admin.runCommand('playsound random.break @s'));
        });
        
        system.run(() => player.runCommand(`kick "${player.name}" .\n§cYou are permanently banned from this server.\n§eReason: §aBanned by §bBlueMods §eDatabase`));
    }
});

function playerBanned(player) {
    if (player.hasTag("ban_database")) {
        system.run(() => {
            player.runCommand(`kick "${player.nameTag}" §cYou are permanently banned from this server.\n§eReason: §aBanned by §bBlueMods §eDatabase`);
        });
    }
}

world.afterEvents.playerSpawn.subscribe((ev) => {
    playerBanned(ev.player);
});