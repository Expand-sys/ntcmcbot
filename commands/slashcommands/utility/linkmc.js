const { CommandInteraction, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { sendResponse, sendReply } = require('../../../utils/utils');
const {dbclient} = require("../../../mongo")
const path = require('path');
const { Rcon } = require("rcon-client");




module.exports = {
    name: `linkmc`,
    description: `link your Discord Account to the Minecraft Server`,
    cooldown: 5,
    type: ApplicationCommandType.ChatInput,
    options: [{
        name: `mcusername`,
        description: `The username of the MC account you want to link`,
        type: ApplicationCommandOptionType.String,
        required: true,
    }],
    /**
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        let mcusr = interaction.options.getString("mcusername")
        interaction.deferReply()
        let highest = "stdusr";
        switch(true) {
        case interaction.member.roles.cache.has(process.env.DISCORDSTAFF_ROLE):
            highest = "discordstaff";
            break;
        case interaction.member.roles.cache.has(process.env.MCSTAFF_ROLE):
            highest = "mcstaff";
            break;
        case interaction.member.roles.cache.has(process.env.PATREON_ROLE):
            highest = "patreon";
            break;
        case interaction.member.roles.cache.has(process.env.BOOSTER_ROLE):
            highest = "booster";
            break;
        }

        let collection = await dbclient.db("ntcmcbot").collection("users");
        // perform actions on the collection object
        collection.updateOne(
            { DISCORDID: `${interaction.member.id}` },   // Query parameter
            { $set: {                     // Replacement document
            DISCORDID: `${interaction.member.id}`,
            MCUSER: `${mcusr}`,
            USRROLE: `${highest}`
            }},
            { upsert: true }      // Options
        )
        collection = await dbclient.db("ntcmcbot").collection("users");
        if(interaction.member.id === await collection.findOne({MCUSR: mcusr}).DISCORDID){
            console.log("beans")
        }

        
        const rcon = new Rcon({
            host: `${process.env.MCHOST}`,
            port: `${process.env.RCON_PORT}`,
            password: `${process.env.RCONPASS}`,
        });
        let connected = true
        let error
        try{
        await rcon.connect();
        } catch(e){
        console.log(e)
        connected = false
        error = e
        }
        

        let clear = await rcon.send(`lp user ${mcusr} parent clear`)
        let res = await rcon.send(`lp user ${mcusr} parent add ${highest}`);
        console.log(res)
        await sendResponse(interaction, `added ${mcusr} to the role ${highest}`);
        await rcon.end();
    }
}


