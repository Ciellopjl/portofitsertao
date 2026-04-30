# 🏋️‍♂️ PortoFit Sertão — Elite Gym Management SaaS

![PortoFit Banner](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop)

> A solução definitiva para gestão de academias, unindo inteligência artificial, automação de cobranças e segurança de nível empresarial.

---

## 🚀 O Projeto

O **PortoFit Sertão** não é apenas um software de gestão; é o cérebro operacional de uma academia moderna. Desenvolvido com as tecnologias mais recentes do mercado, ele foca em três pilares fundamentais: **Segurança Financeira**, **Retenção de Alunos** e **Inteligência Artificial**.

## 💎 Diferenciais Estratégicos

### 🤖 Verificação de Pagamentos por IA (Groq AI)
Implementamos um sistema de visão computacional utilizando o modelo **Llama 3.2 Vision** via Groq SDK. 
*   **Detecção de Fraude**: A IA analisa comprovantes de PIX em milissegundos para identificar sinais de edição.
*   **Alerta de Agendamento**: Identifica automaticamente se o comprovante é apenas um agendamento (que pode ser cancelado) ou um pagamento real.
*   **OCR Inteligente**: Extração automática de valores e datas para conferência rápida.

### 🛡️ Segurança e Whitelist Administrativa
O sistema utiliza um modelo de **Segurança por Whitelist** via Google OAuth.
*   **Acesso Restrito**: Somente e-mails autorizados (Super-Admins) acessam configurações críticas.
*   **Modo Recepção**: Funcionários têm uma visão focada na operação, com dados financeiros sensíveis (faturamento total) ocultados automaticamente.
*   **Monitoramento em Tempo Real**: Status "Online" pulsante para acompanhamento da atividade da equipe.

### 📲 Automação de Cobrança e Retenção
Integração nativa com WhatsApp para garantir que a academia nunca perca uma renovação.
*   **Botões Inteligentes**: O sistema altera a cor e a mensagem de cobrança baseando-se no vencimento do plano (Verde para OK, Amarelo para Vencendo, Vermelho para Vencido).
*   **Mensagens Personalizadas**: Envio de códigos de check-in e lembretes de renovação com um único clique.

### ⚡ Check-in de Alta Performance
Uma interface dedicada para tablets e monitores de recepção.
*   **Validação Instantânea**: O aluno digita o código e o sistema valida o status do plano na hora.
*   **Feedback Visual**: Alertas sonoros e visuais para acesso liberado ou bloqueado.

---

## 🛠️ Tech Stack Premium

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) com [Prisma ORM](https://www.prisma.io/)
*   **Autenticação**: [NextAuth.js](https://next-auth.js.org/) com Google Provider
*   **IA**: [Groq SDK](https://groq.com/) (Llama 3.2 Vision)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animações**: [Framer Motion](https://www.framer.com/motion/)
*   **Ícones**: [Lucide React](https://lucide.dev/)

---

## 🎨 Design Philosophy

O sistema utiliza uma estética **Dark Premium** (Glassmorphism), inspirada nos aplicativos financeiros de luxo. A interface é otimizada para reduzir a fadiga visual dos funcionários que operam o sistema o dia todo, mantendo um ar de sofisticação que valoriza a marca da academia.

---

## 👨‍💻 Desenvolvido por

Este projeto foi concebido e desenvolvido por **ciello dev**. 

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-gold?style=for-the-badge&logo=vercel)](https://ciello-dev.vercel.app/)
[![Instagram](https://img.shields.io/badge/Instagram-Follow-purple?style=for-the-badge&logo=instagram)](https://www.instagram.com/_ciellopjl/)

---

*© 2026 Portofit Sertão. Todos os direitos reservados.*
