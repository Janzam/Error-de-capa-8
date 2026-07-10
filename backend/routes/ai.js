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
      let responseText = "Lo siento, como modelo de demostración estoy limitado a ciertas respuestas. Por favor, selecciona una de las preguntas sugeridas arriba.";
      
      if (lastMessage.match(/hola|buen|saludo|hey/)) {
        responseText = `¡Hola! Soy tu asistente WattIA. Veo que tienes ${appliances.length} equipos registrados. ¿En qué te puedo ayudar hoy? Selecciona una pregunta sugerida.`;
      } else if (lastMessage.match(/gracias|agradecid|excelente|ok/)) {
        responseText = "¡De nada! Estoy aquí para ayudarte a optimizar tu consumo eléctrico. ¡Cualquier otra duda, usa las preguntas sugeridas!";
      } else if (lastMessage.includes("aire")) {
        const aire = appliances.find(a => a.type === "aire");
        if (aire && aire.status === "danger") {
           responseText = `He notado que tu ${aire.name} está consumiendo más de lo normal (${aire.watts} W). Podría faltar gas o tener filtros sucios.`;
        } else {
           responseText = "Para bajar el consumo del aire acondicionado, ajusta el termostato a 24°C, limpia los filtros periódicamente y asegúrate de cerrar puertas y ventanas para no perder el aire frío.";
        }
      } else if (lastMessage.includes("corte") || lastMessage.includes("luz")) {
        responseText = "Ante un corte de energía programado, desconecta tus equipos electrónicos (TV, Laptop, Aire) para protegerlos de picos de voltaje cuando retorne el servicio.";
      } else if (lastMessage.includes("refrigerador") || lastMessage.includes("refri") || lastMessage.includes("nevera") || lastMessage.includes("falla")) {
        const refri = appliances.find(a => a.type === "refrigerador");
        if (refri && refri.status === "danger") {
           responseText = `¡Atención! Tu ${refri.name} consume mucho más de su promedio histórico. Esto es típico de un empaque de puerta desgastado o falta de gas. Sugiero revisión técnica.`;
        } else {
           responseText = "Si notas que el motor no se detiene, la temperatura interna sube, o ves un consumo superior al histórico, es posible que el sello de la puerta esté desgastado o le falte gas.";
        }
      } else if (lastMessage.includes("lavadora")) {
        responseText = "La lavadora consume bastante energía. Te sugiero usarla en carga completa y con agua fría para reducir su impacto en tu planilla.";
      } else if (lastMessage.includes("stand-by") || lastMessage.includes("vampiro")) {
        responseText = "Los equipos en stand-by (como la TV apagada pero enchufada) consumen la llamada 'energía vampiro'. Desconectarlos de la regleta puede ahorrarte hasta un 10% mensual.";
      } else if (lastMessage.includes("ahorr") || lastMessage.includes("bajar")) {
        const total = appliances.reduce((sum, a) => sum + (a.status !== 'off' ? a.watts : 0), 0);
        responseText = `Tu consumo en tiempo real es de aproximadamente ${total}W. Para ahorrar, te sugiero ajustar el termostato del refrigerador y apagar regletas de equipos en stand-by.`;
      }

      return res.json({ content: [{ type: "text", text: responseText }] });
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
