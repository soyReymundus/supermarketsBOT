/**
 * @description Archivo de utilidad encargado de proporcionar distintas funciones para publicar en Discord.
 */

const { Client, GatewayIntentBits, EmbedBuilder, Collection, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require("fs");
require('dotenv').config();
/**
 * La base de datos de canales admitidos.
 * @type {String[]}
 */
var database = JSON.parse(fs.readFileSync("./discord.json").toString());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

client.commands.set("invite", {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get a bot invitation.'),
    exec: (interaction, client) => {
        interaction.reply({
            "embeds": [
                new EmbedBuilder()
                    .setTitle("Agregame a tu servidor!")
                    .setDescription("Para tener a este BOT en tu servidor haz [click aqui](https://discord.com/oauth2/authorize?client_id=1228725876099907694&permissions=8&scope=bot)")
                    .setURL("https://discord.com/oauth2/authorize?client_id=1228725876099907694&permissions=8&scope=bot")
                    .setColor("#00FFFF")
                    .setFooter({ "text": "SupermarketsBOT", "iconURL": "https://media.discordapp.net/attachments/1173017996848013315/1228807964018606120/carrito.jpeg?ex=662d6398&is=661aee98&hm=85c052d5bb4862f48a4d1c144332ed65166adf78c7a82ccfbf20e57bba857dbe&=&format=webp&width=297&height=297" })
            ]
        });
    }
});

client.commands.set("news", {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Sets up a news channel on your server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable the news.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable the news.')
        ),
    exec: (interaction, client) => {
        if (interaction.options.getSubcommand() == 'enable') {
            if (database.includes(interaction.channel.id)) return interaction.reply("Ya estan configuradas las noticias en este canal");

            database.push(interaction.channel.id);

            interaction.reply("Se informara por aqui el precios de los productos!");
        } else if (interaction.options.getSubcommand() == 'disable') {
            if (!database.includes(interaction.channel.id)) return interaction.reply("No estan configuradas las noticias en este canal");

            database = database.filter(num => num != interaction.channel.id);

            interaction.reply("Las noticias quedaron desactivadas!");
        };

        fs.writeFileSync("./discord.json", JSON.stringify(database));
    }
});

client.on("ready", () => {
    client.application.commands.set(client.commands.map(command => command.data.toJSON()));

});

client.on("interactionCreate", (interaction) => {
    if (!client.commands.has(interaction.commandName)) return;

    client.commands.get(interaction.commandName).exec(interaction, client);
});

client.login(process.env["discordToken"]);

/**
 * Publicas la variacion de precios en terminos porcentuales de un conjunto de productos.
 * @param {String} name El nombre del conjunto de productos.
 * @param {Number} rawPercentage La variacion porcentual.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishAveragePercentagePrices(name, rawPercentage, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        try {
            let msg = "";
            let title = "No hubo variacion!";
            let percentage = (rawPercentage * 100).toFixed(2);

            if (rawPercentage > 0) {
                title = "aumento!";
                msg = `El precio de ${name} tuvo una variacion positiva de un **${percentage}%**`;
            } else if (rawPercentage < 0) {
                title = "disminucion!";
                msg = `El precio de ${name} tuvo una variacion negativa de un **${percentage}%**`;
            } else {
                msg = `El precio de ${name} no tuvo variacion`;
            };

            if (!date) {
                msg += ".";
            } else {
                msg += ` este/a ${date}.`
            };

            msg += "\n**Fuentes:** ";

            if (Array.isArray(rawSource)) {
                for (let index = 0; index < rawSource.length; index++) {
                    const rawSrc = rawSource[index];

                    if (0 == index) {
                        msg += rawSrc;
                    } else if (rawSource.length == index + 1) {
                        msg += " y " + rawSrc;
                    } else {
                        msg += ", " + rawSrc;
                    };
                };
            } else {
                msg += rawSource;
            };

            for (let index = 0; index < database.length; index++) {
                try {
                    const channelID = database[index];
                    let channel = await client.channels.fetch(channelID);

                    channel.send({
                        "embeds": [
                            new EmbedBuilder()
                                .setTitle(title)
                                .setDescription(msg)
                                .setURL("https://discord.com/oauth2/authorize?client_id=1228725876099907694&permissions=8&scope=bot")
                                .setColor("#00FFFF")
                                .setFooter({ "text": "SupermarketsBOT", "iconURL": "https://media.discordapp.net/attachments/1173017996848013315/1228807964018606120/carrito.jpeg?ex=662d6398&is=661aee98&hm=85c052d5bb4862f48a4d1c144332ed65166adf78c7a82ccfbf20e57bba857dbe&=&format=webp&width=297&height=297" })
                        ]
                    });

                } catch (e) { };
            };

            resolve();
        } catch (e) {
            reject(e);
        };
    });
};

/**
 * Publicas la variacion de precios.
 * @param {String} name El nombre del conjunto de productos.
 * @param {Number} oldAveragesPrice La variacion porcentual.
 * @param {Number} newAveragesPrice La variacion porcentual.
 * @param {Number} median La mediana actual.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishVariationOfPrices(name, oldAveragesPrice, newAveragesPrice, median, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        try {
            let msg = "";
            let title = "No hubo variacion!";
            let percentage = (operations.getPercentage(oldAveragesPrice, newAveragesPrice) * 100).toFixed(2);

            if (oldAveragesPrice > newAveragesPrice) {
                title = "Inflacion!";
                msg = `El precio de ${name} tuvo una variacion negativa de un **${percentage}%** %FECHA%.\nEl precio promedio acutal es de: **${newAveragesPrice}**\nEl precio mediano acutal es de: **${median}**`;
            } else if (oldAveragesPrice < newAveragesPrice) {
                title = "Deflacion!";
                msg = `El precio de ${name} tuvo una variacion negativa de un **${percentage}%** %FECHA%.\nEl precio promedio acutal es de: **${newAveragesPrice}**\nEl precio mediano acutal es de: **${median}**`;
            } else {
                msg = `El precio de ${name} no tuvo variacion %FECHA%.\nEl precio promedio acutal es de: ${newAveragesPrice}\nEl precio mediano acutal es de: ${median}`;
            };

            if (!date) {
                msg.replace(" %FECHA%", "");
            } else {
                msg.replace("%FECHA%", `este/a ${date}`);
            };

            msg += "\n**Fuentes:** ";

            if (Array.isArray(rawSource)) {
                for (let index = 0; index < rawSource.length; index++) {
                    const rawSrc = rawSource[index];

                    if (0 == index) {
                        msg += rawSrc;
                    } else if (rawSource.length == index + 1) {
                        msg += " y " + rawSrc;
                    } else {
                        msg += ", " + rawSrc;
                    };
                };
            } else {
                msg += rawSource;
            };

            for (let index = 0; index < database.length; index++) {
                try {
                    const channelID = database[index];
                    let channel = await client.channels.fetch(channelID);

                    channel.send({
                        "embeds": [
                            new EmbedBuilder()
                                .setTitle(title)
                                .setDescription(msg)
                                .setURL("https://discord.com/oauth2/authorize?client_id=1228725876099907694&permissions=8&scope=bot")
                                .setColor("#00FFFF")
                                .setFooter({ "text": "SupermarketsBOT", "iconURL": "https://media.discordapp.net/attachments/1173017996848013315/1228807964018606120/carrito.jpeg?ex=662d6398&is=661aee98&hm=85c052d5bb4862f48a4d1c144332ed65166adf78c7a82ccfbf20e57bba857dbe&=&format=webp&width=297&height=297" })
                        ]
                    });

                } catch (e) { };
            };

            resolve();
        } catch (e) {
            reject(e);
        };
    });
};

/**
 * Modulo que proporciona distintas funciones para publicar en Twitter.
 */
module.exports = {
    publishAveragePercentagePrices,
    publishVariationOfPrices
    //publishTopPrices
};