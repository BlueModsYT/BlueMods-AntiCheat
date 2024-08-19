# alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

# bluemods:warn ====================
execute as @s[tag=warn] run replaceitem entity @a[tag=warn] slot.weapon.mainhand 0 air
execute as @s[tag=warn] run tellraw @s[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=warn]"},{"text":" §cis using bucket exploits!"}]}
execute as @s[tag=warn] run tellraw @s[tag=warn] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=warn]"},{"text":" §cyou cant use buckets here!"}]}
tag @s[tag=warn] remove warn

# bluemods:operator ====================
execute as @s[tag=operator] run replaceitem entity @a[tag=operator] slot.weapon.mainhand 0 air
execute as @s[tag=operator] run tellraw @s[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=operator]"},{"text":" §chas been using operator blocks!, §aban the player by using `!ban <player>`"}]}
execute as @s[tag=operator] run tellraw @s[tag=operator] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=operator]"},{"text":" §cyou cant use operator blocks here!"}]}
tag @s[tag=operator] remove operator

# bluemods:notifyworld ====================
execute as @a[tag=notifyworld] run tellraw @a {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=notifyworld]"},{"text":"§a, Got banned for using exploits / hacks"}]}
execute as @a[tag=notifyworld] run tag @s[tag=notifyworld] remove notifyworld

# bluemods:unknown ====================
execute as @s[tag=unknown] run replaceitem entity @a[tag=unknown] slot.weapon.mainhand 0 air
execute as @s[tag=unknown] run tellraw @s[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=unknown]"},{"text":" §cis using unknown blocks/items!, type !ban to ban a user."}]}
execute as @s[tag=unknown] run tellraw @s[tag=unknown] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=unknown]"},{"text":" §cyou cant use unknown blocks/items!"}]}
tag @s[tag=unknown] remove unknown

# bluemods:nolore ====================
execute as @s[tag=nolore] run replaceitem entity @a[tag=nolore] slot.weapon.mainhand 0 air
execute as @s[tag=nolore] run tellraw @s[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=nolore]"},{"text":" §cis using lore / +data blocks!"}]}
execute as @s[tag=nolore] run tellraw @s[tag=nolore] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=nolore]"},{"text":" §cyou cant use +data blocks!"}]}
tag @s[tag=nolore] remove nolore
# bluemods:Nreach ====================
execute as @s[tag=Nreach] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=Nreach"},{"text":" §chis user is using reach hacks, try to spectate him/her."}]}
tag @s[tag=Nreach] remove Nreach

# bluemods:eggdisable ====================
execute as @s[tag=eggdisable] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=eggdisable]"},{"text":" §clooks like this user is trying to get the spawneggs."}]}
execute as @s[tag=eggdisable] run tellraw @a[tag=eggdisable] {"rawtext":[{"text":"§bBlueMods §7>> §cyou must be admin or trusted user to able to access spawn eggs."}]}
replaceitem entity @s[tag=eggdisable] slot.weapon.mainhand 0 air
tag @s[tag=eggdisable] remove eggdisable

# bluemods:database ====================
execute as @s[tag=ban_database] run tellraw @a {"rawtext":[{"text":"§e"},{"selector":"@a[tag=ban_database]"},{"text":"§a, got banned by §sBlueMods §eDataBase\nReason§7 >> §cUser is banned in other realm's"}]}
execute as @s[tag=ban_database] run tag @s[tag=ban_database] add ban
execute as @s[tag=ban_database] run playsound beacon.power @a
kick @s[tag=ban_database] §bBlueMods §7>> §eYou have been banned from the realm\n§eReason§7: §cBanned by BlueMods Database
tag @s[tag=ban_database] remove ban_database

# bluemods:notify ====================
execute as @s[tag=Ngmc] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=gmc]"},{"text":" §ahas set there gamemode to §gCreative."}]}
tag @s[tag=Ngmc] remove Ngmc
execute as @s[tag=Ngms] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=gms]"},{"text":" §ahas set there gamemode to §gSurvival."}]}
tag @s[tag=Ngms] remove Ngms
execute as @s[tag=Ngma] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=gma]"},{"text":" §ahas set there gamemode to §gAdventure."}]}
tag @s[tag=Ngma] remove Ngma
execute as @s[tag=Ngmsp] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=gmsp]"},{"text":" §ahas set there gamemode to §gSpectator."}]}
tag @s[tag=Ngmsp] remove Ngmsp
execute as @s[tag=Nunban] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nunban]"},{"text":" §ahas used §g!unban §ato someone's."}]}
tag @s[tag=Nunban] remove Nunban
execute as @s[tag=Nban] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nban]"},{"text":" §ais using §g!ban §ato someone's."}]}
tag @s[tag=Nban] remove Nban
execute as @s[tag=Nclearlag] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nclearlag]"},{"text":" §ais using §g!clearlag §ato clear entitys on ground."}]}
tag @s[tag=Nclearlag] remove Nclearlag
execute as @s[tag=Ncmdsf] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Ncmdsf]"},{"text":" §ais using §g!cmdsf §ato disable annoying commands."}]}
tag @s[tag=Ncmdsf] remove Ncmdsf
execute as @s[tag=Nclearchat] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nclearchat]"},{"text":" §ais using §g!clearchat/cc §ato clearchat."}]}
tag @s[tag=Nclearchat] remove Nclearchat
execute as @s[tag=Nfreeze] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nfreeze]"},{"text":" §ais using §g!freeze §ato someone's."}]}
execute as @s[tag=Nunfreeze] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nunfreeze]"},{"text":" §ais using §g!unfreeze §ato someone's."}]}
tag @s[tag=Nfreeze] remove Nfreeze
tag @s[tag=Nunfreeze] remove Nunfreeze
execute as @s[tag=Nmute] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nmute]"},{"text":" §ais using §g!mute §ato someone's."}]}
tag @s[tag=Nmute] remove Nmute
execute as @s[tag=Nunmute] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@s[tag=Nunmute]"},{"text":" §ais using §g!unmute §ato someone's."}]}
tag @s[tag=Nunmute] remove Nunmute

# bluemods: removed ban from admins ====================
execute as @s[tag=admin] run tag @s[tag=admin] remove ban
execute as @s[tag=owner] run tag @s[tag=owner] remove ban
tag @a[tag=admin] remove ban
tag @a[tag=owner] remove ban

# bluemods: running function ====================
function ban
function globalban/main

# don't change the globalban just incase so they cant join to your server :).
