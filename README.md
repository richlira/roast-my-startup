# 🔥 Roast My Startup

> Sube tu pitch deck y 3 VCs de IA te van a destrozar sin piedad.
> **Feedback disfrazado de roast.**

## Los VCs

| VC | Personalidad | Especialidad |
|----|--------------|--------------|
| 😤 **Marcus** | Ex-YC Partner, brutal | Producto y mercado |
| 📊 **Victoria** | Growth obsessed | Unit economics, métricas |
| 😬 **David** | El "nice" | Equipo (pero no invierte) |

## Stack

- **Next.js 15** - App Router + Server Actions
- **Tailwind CSS** - Dark fire theme 🔥
- **Claude API** - Streaming responses
- **pdf-parse** - Extracción de texto de PDFs

## Quick Start

```bash
# 1. Clonar e instalar
git clone <repo>
cd roast-my-startup
npm install

# 2. Configurar API key
cp .env.example .env.local
# Editar .env.local con tu ANTHROPIC_API_KEY

# 3. Correr
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy a Vercel

1. Push a GitHub
2. Importar en Vercel
3. Agregar `ANTHROPIC_API_KEY` en Environment Variables
4. Deploy 🚀

## Cómo funciona

1. Usuario sube PDF del pitch deck
2. `pdf-parse` extrae el texto
3. Se envía a Claude con el prompt de los 3 VCs
4. Los VCs "debaten" en tiempo real (streaming)
5. Termina con un Term Sheet de broma

## Estructura

```
roast-my-startup/
├── app/
│   ├── api/roast/route.ts   # API endpoint
│   ├── globals.css          # Estilos + tema
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Upload page
├── components/
│   └── RoastChat.tsx        # Chat streaming UI
├── lib/
│   └── prompts.ts           # Prompts de los VCs
└── ...config files
```

## Para el Hackathon

- Demo en < 2 min: sube un deck falso que hiciste, muestra el roast
- El humor vende: el term sheet de broma es el closer
- Pitch de 15 seg: "Subes tu pitch deck, 3 VCs falsos te lo destrozan, y sales mejor preparado para los de verdad."

---

Hecho con 🔥 para el Hackathon | [Tu Nombre]
