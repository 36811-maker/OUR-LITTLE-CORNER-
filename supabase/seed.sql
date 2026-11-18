-- ==============================================================================
-- OUR LITTLE CORNER 1.0 ♡ - SEED & DEMO REFERENCE
-- ==============================================================================
-- Este arquivo contém exemplos de dados de apoio para testes no banco Supabase.
-- Dica: Crie primeiro os dois usuários pela interface de cadastro web ou no Supabase Auth.
-- ==============================================================================

-- Exemplo de consulta para verificar os usuários registrados no sistema:
-- SELECT id, email, created_at FROM auth.users;

-- Exemplo de consulta para verificar os perfis criados automaticamente:
-- SELECT id, username, display_name, theme FROM public.profiles;

-- Exemplo de verificação do limite de usuários:
-- SELECT count(*) AS total_usuarios, public.is_registration_open() AS cadastro_aberto FROM public.profiles;

