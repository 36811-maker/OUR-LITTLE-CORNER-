/**
 * OUR LITTLE CORNER 1.0 ♡
 * js/login.js - Lógica da Página de Login com Suporte a Acesso Imediato
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Se já estiver logado, redireciona para o dashboard
  await window.AUTH.redirectIfAuthenticated();

  // 2. Elementos do DOM
  const tabLogin = document.getElementById("tab-btn-login");
  const tabRegister = document.getElementById("tab-btn-register");
  const tabReset = document.getElementById("tab-btn-reset");

  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const formReset = document.getElementById("form-reset");

  const cornerStatusEl = document.getElementById("corner-status-text");
  const registerTabBtn = document.getElementById("tab-btn-register");

  let selectedAvatar = "🌸";

  // 3. Checar quantidade de contas cadastradas para controle de registro
  let canRegister = false;
  let totalProfiles = 0;

  try {
    const supabase = window.DB.getClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    totalProfiles = error ? 0 : (count || 0);

    if (totalProfiles === 0) {
      cornerStatusEl.innerHTML = `<span>🌸 O cantinho está pronto! Crie a 1ª conta abaixo (0/2)</span>`;
      canRegister = true;
      // Abre direto na aba de criar conta para facilitar
      switchTab("register");
    } else if (totalProfiles === 1) {
      cornerStatusEl.innerHTML = `<span>💌 1 conta cadastrada. Aguardando a outra metade! (1/2)</span>`;
      canRegister = true;
    } else {
      cornerStatusEl.innerHTML = `<span>🔒 Cantinho completo para os 2 parceiros (2/2)</span>`;
      canRegister = false;
      registerTabBtn.disabled = true;
      registerTabBtn.title = "O limite de 2 contas já foi atingido.";
    }
  } catch (err) {
    console.warn("Erro ao verificar contas:", err);
    canRegister = true;
  }

  // 4. Troca de Abas
  function switchTab(target) {
    [tabLogin, tabRegister, tabReset].forEach(b => b.classList.remove("active"));
    [formLogin, formRegister, formReset].forEach(f => f.style.display = "none");

    if (target === "login") {
      tabLogin.classList.add("active");
      formLogin.style.display = "block";
    } else if (target === "register") {
      if (!canRegister) {
        window.UTILS.showToast("Novos cadastros estão bloqueados: as 2 contas já existem!", "warning");
        return;
      }
      tabRegister.classList.add("active");
      formRegister.style.display = "block";
    } else if (target === "reset") {
      tabReset.classList.add("active");
      formReset.style.display = "block";
    }

    if (window.romanticAudio) window.romanticAudio.playPop();
  }

  tabLogin.addEventListener("click", () => switchTab("login"));
  tabRegister.addEventListener("click", () => switchTab("register"));
  tabReset.addEventListener("click", () => switchTab("reset"));

  // Link para recuperação de senha
  const forgotLink = document.getElementById("link-forgot-password");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("reset");
    });
  }

  // Link opcional para conectar ao Supabase em nuvem
  const setupSupabaseLink = document.getElementById("link-setup-supabase");
  if (setupSupabaseLink) {
    setupSupabaseLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.DB.showSetupNotice();
    });
  }

  // Botão de Acesso Rápido de Teste (Cria 2 contas pré-configuradas e entra com um clique)
  const quickDemoBtn = document.getElementById("btn-quick-demo");
  if (quickDemoBtn) {
    quickDemoBtn.addEventListener("click", async () => {
      try {
        quickDemoBtn.disabled = true;
        quickDemoBtn.innerHTML = `<span class="olc-spinner"></span> Entrando no Cantinho...`;

        // Se for modo local e ainda não existirem usuários, cria os 2 perfis amorosos
        const supabase = window.DB.getClient();
        if (supabase.isLocal) {
          const users = JSON.parse(localStorage.getItem("olc_local_users") || "[]");
          if (users.length === 0) {
            // Cria usuário 1 (Dengo)
            await window.AUTH.signup("dengo@cantinho.com", "123456", "Dengo", "dengo", "");
            // Cria usuário 2 (Amor)
            const u2 = {
              id: "demo-user-2",
              email: "amor@cantinho.com",
              password: "123456",
              user_metadata: { display_name: "Meu Amor", username: "amor" }
            };
            const currentUsers = JSON.parse(localStorage.getItem("olc_local_users") || "[]");
            currentUsers.push(u2);
            localStorage.setItem("olc_local_users", JSON.stringify(currentUsers));

            const profiles = JSON.parse(localStorage.getItem("olc_tbl_profiles") || "[]");
            profiles.push({
              id: "demo-user-2",
              email: "amor@cantinho.com",
              username: "amor",
              display_name: "Meu Amor",
              avatar_url: "",
              bio: "A outra metade deste cantinho ♡",
              theme: "light",
              sound_enabled: true,
              sound_volume: 0.7,
              relationship_start_date: "2024-01-01",
              created_at: new Date().toISOString()
            });
            localStorage.setItem("olc_tbl_profiles", JSON.stringify(profiles));
          } else {
            // Faz login com o primeiro usuário existente
            await window.AUTH.login(users[0].email, users[0].password);
          }
        } else {
          // Em nuvem, tenta login com demo se existir
          await window.AUTH.login("dengo@cantinho.com", "123456");
        }

        window.UTILS.triggerConfetti();
        window.UTILS.showToast("Acesso liberado com amor! Entrando no cantinho... ♡", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      } catch (err) {
        console.warn("Acesso rápido:", err);
        // Preenche campos para o usuário
        document.getElementById("login-email").value = "dengo@cantinho.com";
        document.getElementById("login-password").value = "123456";
        switchTab("login");
        window.UTILS.showToast("Credenciais preenchidas! Clique em Entrar.", "info");
        quickDemoBtn.disabled = false;
        quickDemoBtn.innerHTML = `⚡ Acesso Rápido de Teste (Dengo & Amor) ♡`;
      }
    });
  }

  // 5. Seleção de Avatar
  const avatarButtons = document.querySelectorAll(".avatar-preset-item");
  avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      avatarButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAvatar = btn.getAttribute("data-avatar") || "🌸";
      if (window.romanticAudio) window.romanticAudio.playPop();
    });
  });

  // 6. Mostrar/Ocultar Senha
  const togglePassBtns = document.querySelectorAll(".toggle-password-btn");
  togglePassBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === "password") {
          input.type = "text";
          btn.textContent = "🙈";
        } else {
          input.type = "password";
          btn.textContent = "👁️";
        }
      }
    });
  });

  // 7. Submit de Login
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = formLogin.querySelector("button[type='submit']");

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="olc-spinner"></span> Entrando...`;

      await window.AUTH.login(email, password);
      window.UTILS.showToast("Bem-vindo(a) de volta ao nosso cantinho! ♡", "success");
      if (window.romanticAudio) window.romanticAudio.playChime();

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    } catch (err) {
      console.error("Erro no login:", err);
      let msg = "E-mail ou senha incorretos. Verifique suas credenciais.";
      if (err.message && err.message.includes("Invalid login credentials")) {
        msg = "E-mail ou senha incorretos.";
      } else if (err.message) {
        msg = err.message;
      }
      window.UTILS.showToast(msg, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Entrar no Nosso Cantinho ♡`;
    }
  });

  // 8. Submit de Cadastro
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const displayName = document.getElementById("reg-display-name").value.trim();
    const username = document.getElementById("reg-username").value.trim().toLowerCase();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;
    const submitBtn = formRegister.querySelector("button[type='submit']");

    if (password !== confirmPassword) {
      window.UTILS.showToast("As senhas digitadas não coincidem!", "error");
      return;
    }

    if (password.length < 6) {
      window.UTILS.showToast("A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="olc-spinner"></span> Criando sua conta...`;

      const avatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%23FFF4E8"/><text x="32" y="42" font-size="32" text-anchor="middle">${encodeURIComponent(selectedAvatar)}</text></svg>`;

      await window.AUTH.signup(email, password, displayName, username, avatarSvg);
      
      window.UTILS.triggerConfetti();
      window.UTILS.showToast("Conta criada com amor! Entrando no cantinho...", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (err) {
      console.error("Erro no cadastro:", err);
      window.UTILS.showToast(err.message || "Não foi possível criar a conta.", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Criar Minha Conta no Cantinho ♡`;
    }
  });

  // 9. Submit de Recuperação de Senha
  formReset.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reset-email").value.trim();
    const submitBtn = formReset.querySelector("button[type='submit']");

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="olc-spinner"></span> Enviando...`;

      await window.AUTH.resetPassword(email);
      window.UTILS.showToast("Instruções de recuperação enviadas com sucesso!", "success");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Enviar Instruções de Recuperação`;
      setTimeout(() => switchTab("login"), 2000);
    } catch (err) {
      console.error("Erro na recuperação:", err);
      window.UTILS.showToast(err.message || "Erro ao solicitar recuperação.", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Enviar Instruções de Recuperação`;
    }
  });
});
