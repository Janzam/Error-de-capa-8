const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { Anthropic } = require('@anthropic-ai/sdk');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key'
});

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Fetch context
    const appliances = await prisma.appliance.findMany({
      where: { userId: req.user.userId }
    });
    
    const contextStr = appliances.map(a => `- ${a.name} (${a.type}): ${a.watts}W, estado: ${a.status}`).join('\n');
    
    const systemPrompt = `Eres el asistente de WattIA, una app ecuatoriana de monitoreo de consumo eléctrico residencial. 
Responde en español, en tono cercano y práctico, en máximo 3-4 líneas. Da tips concretos sobre ahorro energético.
El usuario tiene registrados los siguientes electrodomésticos:\n${contextStr || 'Ninguno'}`;

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "tu_clave_api_de_anthropic_aqui") {
      // Simulación de IA para el concurso
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      let responseText = "Entendido. Recuerda apagar los equipos que no utilices para ahorrar energía.";
      
      if (lastMessage.includes("aire")) {
        responseText = "He notado que tu Aire Acondicionado Sala está registrando un consumo 30% superior a lo normal. Podría deberse a falta de gas o filtros sucios. Te recomiendo realizar un mantenimiento preventivo.";
      } else if (lastMessage.includes("ahorr")) {
        responseText = "Para ahorrar energía con tus equipos actuales, te sugiero ajustar el termostato del refrigerador a nivel medio y apagar la regleta de la TV y Laptop cuando no los uses de noche.";
      } else if (lastMessage.includes("corte")) {
         responseText = "Ante un corte de energía programado, desconecta tus equipos electrónicos (TV, Laptop, Aire) para protegerlos de picos de voltaje cuando retorne el servicio.";
      }

      return res.json({ content: [{ text: responseText }] });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    });

    res.json({ content: response.content });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Error contacting AI service" });
  }
});

module.exports = router;
