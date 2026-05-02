"use strict";

// ═══════════════════════════════════════════════
// 🔧 AYARLAR — Kendi bilgilerini gir
// ═══════════════════════════════════════════════
const CONFIG = {
  token:             "BOT_TOKEN",            // 🤖 Bot token
  staffRoleId:       "STAFF_ROLE_ID",        // 👮 Yetkili rol ID
  logChannelId:      "LOG_CHANNEL_ID",       // 📋 Log kanal ID
  ticketCategoryId:  "TICKET_CATEGORY_ID",   // 📁 Ticket kategori ID
  archiveCategoryId: "ARCHIVE_CATEGORY_ID",  // 🗃️ Arşiv kategori ID
  serverName:        "Aze RolePlay",         // 🏙️ Sunucu adı
  bannerUrl:         "https://i.imgur.com/BANNER.png", // 🖼️ Banner URL
  maxTicketsPerUser: 1,                      // 🔢 Kullanıcı başı max ticket
};

// ═══════════════════════════════════════════════
// 🎭 EMOJİLER
// ═══════════════════════════════════════════════
const E = {
  ticket:  "🎫",
  user:    "👤",
  reason:  "📋",
  time:    "🕐",
  lock:    "🔒",
  unlock:  "🔓",
  check:   "✅",
  cross:   "❌",
  pray:    "🙏",
  log:     "📝",
  support: "🎧",
  info:    "ℹ️",
  warning: "⚠️",
  star:    "⭐",
  wave:    "👋",
  rp:      "🎭",
  police:  "👮",
  city:    "🏙️",
  fire:    "🔥",
  shield:  "🛡️",
  pin:     "📌",
  trash:   "🗑️",
};

// ═══════════════════════════════════════════════
// 📦 KÜTÜPHANELERİ YÜKLE
// ═══════════════════════════════════════════════
const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");

const { createTranscript } = require("discord-html-transcripts");

// ═══════════════════════════════════════════════
// 🤖 İSTEMCİ OLUŞTUR
// ═══════════════════════════════════════════════
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

// Bellek içi depolama
const tickets     = new Map(); // channelId -> { ticketId, userId, reason, openedAt }
const userTickets = new Map(); // userId -> channelId
let   ticketCount = 0;

// ═══════════════════════════════════════════════
// 🟢 HAZIR EVENTİ
// ═══════════════════════════════════════════════
client.once("ready", () => {
  console.log("\n╔══════════════════════════════════════╗");
  console.log(`║  ${E.check}  Bot Aktif: ${client.user.tag}`);
  console.log(`║  ${E.rp}  Sunucu  : ${CONFIG.serverName}`);
  console.log(`║  ${E.star}  Versiyon: 2.0.0`);
  console.log("╚══════════════════════════════════════╝\n");

  client.user.setPresence({
    activities: [{ name: `${CONFIG.serverName} | Destek`, type: 3 }],
    status: "online",
  });
});

// ═══════════════════════════════════════════════
// 🛠️ YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════

/** Yetkili mi kontrolü */
function isStaff(member) {
  return (
    member.roles.cache.has(CONFIG.staffRoleId) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

/** Ticket paneli embed'ini oluştur */
function buildPanelContainer() {
  return new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(CONFIG.bannerUrl)
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${E.rp} ${CONFIG.serverName} — Destek Merkezi\n\n` +
        `${E.wave} Sunucumuza hoş geldiniz!\n\n` +
        `${E.city} Herhangi bir sorun, şikayet veya sorunuz varsa —\n` +
        `aşağıdaki düğmeye basarak destek talebi oluşturun.`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${E.shield} **Ticket açmadan önce:**\n` +
        `> ${E.star} Probleminizi açık ve ayrıntılı şekilde açıklayın\n` +
        `> ${E.star} Kanıtınız varsa — ekran görüntüsü hazır bulundurun\n` +
        `> ${E.star} Gereksiz ticket açmaktan kaçının\n` +
        `> ${E.rp} RolePlay kurallarını çiğnediğinizi düşünüyorsanız hemen bildirin`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${E.police} Ekibimiz en kısa sürede sizinle iletişime geçecek.\n` +
        `${E.fire} ${CONFIG.serverName} — Azerbaycan'ın en iyi RP sunucusu!\n\n` +
        `*MarvelCode ❤️ RaylexDev*`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_open")
          .setEmoji(E.ticket)
          .setLabel("Ticket Aç")
          .setStyle(ButtonStyle.Primary)
      )
    );
}

/** Yeni ticket kanalının içeriğini oluştur */
function buildTicketContainer(ticketData, userId) {
  return new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(CONFIG.bannerUrl)
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${E.ticket} Ticket #${ticketData.ticketId} — ${CONFIG.serverName}\n\n` +
        `${E.wave} Merhaba <@${userId}>! Destek talebiniz başarıyla oluşturuldu.`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${E.user} **Talep Eden:** <@${userId}>\n` +
        `${E.reason} **Talep Sebebi:**\n> ${ticketData.reason}\n` +
        `${E.time} **Açılış Zamanı:** <t:${Math.floor(ticketData.openedAt / 1000)}:F>`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${E.police} Ekibimiz <@&${CONFIG.staffRoleId}> en kısa sürede sizinle iletişime geçecek.\n\n` +
        `${E.info} Probleminizi daha ayrıntılı açıklamaya devam edebilirsiniz.\n` +
        `Ekran görüntüsü, hata mesajı veya kanıt varsa bu kanala gönderin.\n\n` +
        `${E.warning} Ticketi gereksiz yere kapatmaktan kaçının.\n` +
        `${E.pray} Sabrınız için teşekkür ederiz!`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_add_user")
          .setEmoji(E.user)
          .setLabel("Kullanıcı Ekle")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("ticket_remove_user")
          .setEmoji(E.cross)
          .setLabel("Kullanıcı Çıkar")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setEmoji(E.lock)
          .setLabel("Ticketi Kapat")
          .setStyle(ButtonStyle.Danger)
      )
    );
}

/** Log kanalına ticket kapanış kaydı gönder */
async function sendCloseLog(guild, ticketData, closedBy) {
  const logChannel = guild.channels.cache.get(CONFIG.logChannelId);
  if (!logChannel) return;

  try {
    const ticketChannel = guild.channels.cache.get(ticketData.channelId);
    if (ticketChannel) {
      const attachment = await createTranscript(ticketChannel, {
        filename:   `ticket-${ticketData.ticketId}.html`,
        saveImages: true,
        poweredBy:  false,
      });

      const duration = Math.floor((Date.now() - ticketData.openedAt) / 1000 / 60);
      const logContainer = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${E.log} Ticket #${ticketData.ticketId} — Transkript\n\n` +
          `${E.rp} **Sunucu:** ${CONFIG.serverName}\n` +
          `${E.user} **Açan:** <@${ticketData.userId}>\n` +
          `${E.lock} **Kapatan:** <@${closedBy}>\n` +
          `${E.reason} **Sebep:** ${ticketData.reason}\n` +
          `${E.time} **Süre:** ${duration} dakika\n` +
          `${E.time} **Kapanış Zamanı:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `*MarvelCode ❤️ RaylexDev*`
        )
      );
      await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 });
      await logChannel.send({ files: [attachment] });
    }
  } catch (err) {
    console.error(`${E.cross} Log gönderilemedi:`, err.message);
  }
}

// ═══════════════════════════════════════════════
// 💬 MESAJ KOMUTLARI
// ═══════════════════════════════════════════════
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = ".";
  if (!message.content.startsWith(prefix)) return;

  const args    = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // ── .ping ──
  if (command === "ping") {
    try {
      const sent = await message.reply(`${E.time} Hesaplanıyor...`);
      const ms   = sent.createdTimestamp - message.createdTimestamp;
      await sent.edit(
        `${E.check} **Bot Gecikmesi:** \`${ms}ms\`\n` +
        `${E.support} **API Gecikmesi:** \`${Math.round(client.ws.ping)}ms\``
      );
    } catch {}
    return;
  }

  // ── .ticket ── (panel gönder)
  if (command === "ticket") {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({ content: `${E.cross} Bu komut için yetkiniz yok.` }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    try {
      const container = buildPanelContainer();
      await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      await message.delete().catch(() => {});
    } catch (err) {
      console.error(`${E.cross} Panel gönderilemedi:`, err.message);
    }
    return;
  }

  // ── .ticketler ── (açık ticketleri listele)
  if (command === "ticketler") {
    if (!isStaff(message.member)) {
      return message.reply({ content: `${E.cross} Bu komut için yetkiniz yok.` }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    if (tickets.size === 0) {
      return message.reply({ content: `${E.info} Şu anda açık ticket bulunmuyor.` });
    }
    let liste = `${E.ticket} **Açık Ticketler (${tickets.size}):**\n\n`;
    for (const [channelId, data] of tickets) {
      liste += `> ${E.pin} <#${channelId}> — <@${data.userId}> — Ticket #${data.ticketId}\n`;
    }
    return message.reply({ content: liste });
  }

  // ── .yardim ── (komut listesi)
  if (command === "yardim") {
    if (!isStaff(message.member)) return;
    const yardim =
      `## ${E.support} Komut Listesi\n\n` +
      `${E.shield} **Yönetici Komutları:**\n` +
      `> \`.ticket\` — Ticket panelini gönder\n` +
      `> \`.ticketler\` — Açık ticketleri listele\n\n` +
      `${E.star} **Genel Komutlar:**\n` +
      `> \`.ping\` — Bot gecikmesini göster\n` +
      `> \`.yardim\` — Bu mesajı göster\n\n` +
      `*MarvelCode ❤️ RaylexDev*`;
    return message.reply({ content: yardim });
  }
});

// ═══════════════════════════════════════════════
// 🔘 ETKİLEŞİM HANDLERLARI
// ═══════════════════════════════════════════════
client.on("interactionCreate", async (interaction) => {

  // ── Ticket Aç düğmesi ──
  if (interaction.isButton() && interaction.customId === "ticket_open") {
    if (userTickets.has(interaction.user.id)) {
      return interaction.reply({
        content: `${E.warning} Zaten açık bir ticketiniz var: <#${userTickets.get(interaction.user.id)}>`,
        flags: MessageFlags.Ephemeral,
      });
    }
    const modal = new ModalBuilder()
      .setCustomId("ticket_modal")
      .setTitle(`${E.ticket} Ticket Aç — ${CONFIG.serverName}`);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setLabel("Talep Sebebi")
          .setPlaceholder("Probleminizi ayrıntılı açıklayın...")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMinLength(10)
          .setMaxLength(500)
      )
    );
    return interaction.showModal(modal);
  }

  // ── Ticket modal gönder ──
  if (interaction.isModalSubmit() && interaction.customId === "ticket_modal") {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const reason = interaction.fields.getTextInputValue("reason");
    ticketCount++;
    const ticketId = ticketCount;
    const guild    = interaction.guild;
    const openedAt = Date.now();

    let channel;
    try {
      channel = await guild.channels.create({
        name: `ticket-${ticketId}`,
        type: ChannelType.GuildText,
        parent: CONFIG.ticketCategoryId,
        topic: `Ticket #${ticketId} | ${interaction.user.tag} | ${reason.slice(0, 80)}`,
        permissionOverwrites: [
          { id: guild.roles.everyone,    deny:  [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id,     allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
          { id: CONFIG.staffRoleId,      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages] },
        ],
      });
    } catch (err) {
      console.error(`${E.cross} Kanal oluşturulamadı:`, err.message);
      return interaction.editReply({ content: `${E.cross} Ticket oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.` });
    }

    const ticketData = { ticketId, userId: interaction.user.id, reason, openedAt, channelId: channel.id };
    tickets.set(channel.id, ticketData);
    userTickets.set(interaction.user.id, channel.id);

    const container = buildTicketContainer(ticketData, interaction.user.id);
    await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

    // Yetkilileri etiketle (sessiz bildirim)
    const pingMsg = await channel.send(`<@&${CONFIG.staffRoleId}> — Yeni ticket!`);
    await pingMsg.delete().catch(() => {});

    return interaction.editReply({
      content: `${E.check} Ticket kanalınız açıldı: <#${channel.id}>`,
    });
  }

  // ── Kullanıcı Ekle düğmesi ──
  if (interaction.isButton() && interaction.customId === "ticket_add_user") {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: `${E.cross} Bu işlem için yetkiniz yok.`, flags: MessageFlags.Ephemeral });

    const modal = new ModalBuilder()
      .setCustomId("ticket_add_modal")
      .setTitle("👤 Kullanıcı Ekle");
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("Kullanıcı ID")
        .setPlaceholder("Discord ID girin...")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    ));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "ticket_add_modal") {
    const userId = interaction.fields.getTextInputValue("user_id").trim();
    if (!/^\d{17,20}$/.test(userId))
      return interaction.reply({ content: `${E.cross} Geçersiz kullanıcı ID formatı.`, flags: MessageFlags.Ephemeral });

    try {
      await interaction.channel.permissionOverwrites.edit(userId, {
        ViewChannel:  true,
        SendMessages: true,
        AttachFiles:  true,
      });
      return interaction.reply({ content: `${E.check} <@${userId}> tickete eklendi.`, flags: MessageFlags.Ephemeral });
    } catch {
      return interaction.reply({ content: `${E.cross} Kullanıcı eklenemedi. ID'yi kontrol edin.`, flags: MessageFlags.Ephemeral });
    }
  }

  // ── Kullanıcı Çıkar düğmesi ──
  if (interaction.isButton() && interaction.customId === "ticket_remove_user") {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: `${E.cross} Bu işlem için yetkiniz yok.`, flags: MessageFlags.Ephemeral });

    const modal = new ModalBuilder()
      .setCustomId("ticket_remove_modal")
      .setTitle("❌ Kullanıcı Çıkar");
    modal.addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("user_id")
        .setLabel("Kullanıcı ID")
        .setPlaceholder("Discord ID girin...")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
    ));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "ticket_remove_modal") {
    const userId     = interaction.fields.getTextInputValue("user_id").trim();
    const ticketData = tickets.get(interaction.channel.id);

    if (!/^\d{17,20}$/.test(userId))
      return interaction.reply({ content: `${E.cross} Geçersiz kullanıcı ID formatı.`, flags: MessageFlags.Ephemeral });

    if (ticketData && userId === ticketData.userId)
      return interaction.reply({ content: `${E.cross} Ticket sahibi çıkarılamaz.`, flags: MessageFlags.Ephemeral });

    try {
      await interaction.channel.permissionOverwrites.delete(userId);
      return interaction.reply({ content: `${E.check} <@${userId}> ticketten çıkarıldı.`, flags: MessageFlags.Ephemeral });
    } catch {
      return interaction.reply({ content: `${E.cross} Kullanıcı çıkarılamadı. ID'yi kontrol edin.`, flags: MessageFlags.Ephemeral });
    }
  }

  // ── Ticketi Kapat düğmesi ──
  if (interaction.isButton() && interaction.customId === "ticket_close") {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: `${E.cross} Bu işlem için yetkiniz yok.`, flags: MessageFlags.Ephemeral });

    const ticketData = tickets.get(interaction.channel.id);
    if (!ticketData)
      return interaction.reply({ content: `${E.cross} Bu kanal bir ticket değil.`, flags: MessageFlags.Ephemeral });

    await interaction.reply({ content: `${E.lock} Ticket kapatılıyor, transkript hazırlanıyor...` });

    // Log gönder
    await sendCloseLog(interaction.guild, ticketData, interaction.user.id);

    // İzinleri kısıtla ve arşive taşı
    await interaction.channel.permissionOverwrites.edit(ticketData.userId, { ViewChannel: false }).catch(() => {});
    await interaction.channel.setParent(CONFIG.archiveCategoryId, { lockPermissions: false }).catch(() => {});
    await interaction.channel.setName(`arsiv-${ticketData.ticketId}`).catch(() => {});

    userTickets.delete(ticketData.userId);

    const reopenContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${E.lock} **Ticket kapatıldı.**\n` +
          `Kapatan: <@${interaction.user.id}> — <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
          `${E.rp} Yeniden açmak veya silmek için aşağıdaki düğmeleri kullanın.\n\n` +
          `*MarvelCode ❤️ RaylexDev*`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_reopen")
            .setEmoji(E.unlock)
            .setLabel("Yeniden Aç")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("ticket_delete")
            .setEmoji(E.trash)
            .setLabel("Sil")
            .setStyle(ButtonStyle.Danger)
        )
      );

    await interaction.channel.send({ components: [reopenContainer], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  // ── Ticket Sil düğmesi ──
  if (interaction.isButton() && interaction.customId === "ticket_delete") {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: `${E.cross} Bu işlem için yetkiniz yok.`, flags: MessageFlags.Ephemeral });

    const ticketData = tickets.get(interaction.channel.id);
    if (ticketData) {
      userTickets.delete(ticketData.userId);
      tickets.delete(interaction.channel.id);
    }

    await interaction.reply({ content: `${E.trash} Kanal siliniyor...` });
    await new Promise(r => setTimeout(r, 2000));
    await interaction.channel.delete().catch(() => {});
    return;
  }

  // ── Ticketi Yeniden Aç düğmesi ──
  if (interaction.isButton() && interaction.customId === "ticket_reopen") {
    if (!isStaff(interaction.member))
      return interaction.reply({ content: `${E.cross} Bu işlem için yetkiniz yok.`, flags: MessageFlags.Ephemeral });

    const ticketData = tickets.get(interaction.channel.id);
    if (!ticketData)
      return interaction.reply({ content: `${E.cross} Ticket verisi bulunamadı.`, flags: MessageFlags.Ephemeral });

    if (userTickets.has(ticketData.userId)) {
      return interaction.reply({
        content: `${E.warning} Kullanıcının zaten açık bir ticketi var: <#${userTickets.get(ticketData.userId)}>`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.channel.setParent(CONFIG.ticketCategoryId, { lockPermissions: false }).catch(() => {});
    await interaction.channel.setName(`ticket-${ticketData.ticketId}`).catch(() => {});
    await interaction.channel.permissionOverwrites.edit(ticketData.userId, {
      ViewChannel:  true,
      SendMessages: true,
      AttachFiles:  true,
    }).catch(() => {});

    userTickets.set(ticketData.userId, interaction.channel.id);

    return interaction.reply({
      content: `${E.check} Ticket yeniden açıldı. <@${ticketData.userId}> artık erişebilir.`,
    });
  }
});

// ═══════════════════════════════════════════════
// 🚨 HATA YÖNETİMİ
// ═══════════════════════════════════════════════
process.on("unhandledRejection", (err) => {
  console.error(`${E.warning} İşlenmemiş hata:`, err?.message ?? err);
});

process.on("uncaughtException", (err) => {
  console.error(`${E.cross} Kritik hata:`, err?.message ?? err);
});

client.on("error", (err) => {
  console.error(`${E.cross} Bot bağlantı hatası:`, err.message);
});

// ═══════════════════════════════════════════════
// 🚀 BOTU BAŞLAT
// ═══════════════════════════════════════════════
client.login(CONFIG.token).catch((err) => {
  console.error(`\n${E.cross} Giriş Hatası: ${err.message}`);
  console.error(`${E.warning} CONFIG.token değerini kontrol edin!`);
  process.exit(1);
});
