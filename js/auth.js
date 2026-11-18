/**
 * OUR LITTLE CORNER 1.0 ♡
 * js/auth.js - Autenticação Real Supabase, Proteção de Rotas e Gerenciamento de Sessão
 */

window.AUTH = {
  // Retorna a sessão ativa atual
  async getSession() {
    const supabase = window.DB.getClient();
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erro ao buscar sessão:", error);
      return null;
    }
    return session;
  },

  // Retorna o usuário autenticado
  async getUser() {
    const session = await this.getSession();
    return session ? session.user : null;
  },

  // Busca o perfil do usuário logado na tabela profiles
  async getCurrentProfile() {
    const user = await this.getUser();
    if (!user) return null;

    const supabase = window.DB.getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao obter perfil:", error);
      return null;
    }
    return data;
  },

  // Busca o perfil da outra pessoa (o parceiro / amor)
  async getPartnerProfile() {
    const user = await this.getUser();
    if (!user) return null;

    const supabase = window.DB.getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao obter perfil do parceiro:", error);
      return null;
    }
    return data;
  },

  // Verifica se o cadastro está liberado (máximo estrito de 2 usuários)
  async isRegistrationAllowed() {
    const supabase = window.DB.getClient();
    if (!supabase) return false;

    try {
      // Tenta chamar a RPC segura do backend
      const { data, error } = await supabase.rpc("is_registration_open");
      if (!error && typeof data === "boolean") {
        return data;
      }

      // Fallback: contagem direta de perfis
      const { count, error: countErr } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      if (countErr) {
        console.warn("Erro ao checar contagem de perfis:", countErr);
        return false;
      }

      return (count || 0) < 2;
    } catch (e) {
      console.error("Erro ao checar permissão de cadastro:", e);
      return false;
    }
  },

  // Login com E-mail e Senha
  async login(email, password) {
    const supabase = window.DB.getClient();
    if (!supabase) throw new Error("Supabase não configurado.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    return data;
  },

  // Cadastro de Novo Usuário (com verificação prévia e bloqueio atômico de 2 contas)
  async signup(email, password, displayName, username, avatarUrl = "") {
    const supabase = window.DB.getClient();
    if (!supabase) throw new Error("Supabase não configurado.");

    // Verificação inicial no frontend
    const allowed = await this.isRegistrationAllowed();
    if (!allowed) {
      throw new Error("Este cantinho já possui as duas pessoas autorizadas cadastradas. Novos cadastros estão bloqueados.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: username.trim().toLowerCase(),
          avatar_url: avatarUrl
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Logout seguro (não apaga credenciais nem dados salvos)
  async logout() {
    const supabase = window.DB.getClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "login.html";
  },

  // Recuperação de senha segura via e-mail
  async resetPassword(email) {
    const supabase = window.DB.getClient();
    if (!supabase) throw new Error("Supabase não configurado.");

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login.html?action=reset`
    });

    if (error) throw error;
    return data;
  },

  // Atualizar e-mail do próprio usuário
  async updateEmail(newEmail) {
    const supabase = window.DB.getClient();
    if (!supabase) throw new Error("Supabase não configurado.");

    const { data, error } = await supabase.auth.updateUser({
      email: newEmail.trim()
    });

    if (error) throw error;
    return data;
  },

  // Atualizar senha do próprio usuário
  async updatePassword(newPassword) {
    const supabase = window.DB.getClient();
    if (!supabase) throw new Error("Supabase não configurado.");

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  // Atualizar dados do perfil (display_name, bio, avatar_url, theme, sound settings)
  async updateProfile(updates) {
    const user = await this.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const supabase = window.DB.getClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Guarda de Rota para páginas restritas: redireciona para login se não estiver logado
  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }

    // Aplica o tema salvo do usuário
    const profile = await this.getCurrentProfile();
    if (profile && profile.theme) {
      document.documentElement.setAttribute("data-theme", profile.theme);
    }
    return profile;
  },

  // Guarda de Rota para a tela de login: redireciona para dashboard se já estiver autenticado
  async redirectIfAuthenticated() {
    const session = await this.getSession();
    if (session) {
      window.location.href = "dashboard.html";
    }
  }
};

