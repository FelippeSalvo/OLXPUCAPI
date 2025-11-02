using System;
using System.Collections.Generic;
using System.Linq;
using OLXPUCAPI.Models;
using OLXPUCAPI.Repositories;

namespace OLXPUCAPI.Services
{
    public class UserService
    {
        private readonly JsonRepository<User> _repo;

        public UserService(JsonRepository<User> repo)
        {
            _repo = repo;
        }

        public IEnumerable<User> GetAll()
        {
            return _repo.GetAll();
        }

        public User? GetById(Guid id)
        {
            return _repo.GetById(id);
        }

        // Simple register (no hashing, academic work). Check for duplicate email.
        public (bool Success, string? Error, User? Created) Create(string name, string email, string password, Role role = Role.User)
        {
            var exists = _repo.GetAll().Any(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            if (exists) return (false, "Email já cadastrado", null);

            var u = new User
            {
                Name = name,
                Email = email,
                Password = password,
                Role = role
            };

            _repo.Add(u);
            return (true, null, u);
        }

        // Simple authentication: returns the user if credentials match
        public User? Authenticate(string email, string password)
        {
            return _repo.GetAll()
                .FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase) && u.Password == password);
        }

        public bool Update(User user)
        {
            var existing = _repo.GetById(user.Id);
            if (existing == null) return false;

            // Preserva Password se não for fornecido ou estiver vazio na atualização
            if (string.IsNullOrWhiteSpace(user.Password) && !string.IsNullOrWhiteSpace(existing.Password))
            {
                user.Password = existing.Password;
            }

            // Course e Phone podem ser null (limpar) ou ter valores (atualizar)
            // Se forem null, mantém null (limpa o campo)
            // Se tiverem valor, atualiza com o novo valor
            // Isso permite tanto atualizar quanto limpar esses campos opcionais
            
            // Log para debug (pode remover em produção)
            System.Diagnostics.Debug.WriteLine($"Atualizando usuário {user.Id}: Course={user.Course}, Phone={user.Phone}");

            // keep same Id, just replace fields
            _repo.Update(user);
            
            // Verifica se foi salvo corretamente
            var verificacao = _repo.GetById(user.Id);
            System.Diagnostics.Debug.WriteLine($"Verificação após salvar: Course={verificacao?.Course}, Phone={verificacao?.Phone}");
            
            return true;
        }

        public bool Delete(Guid id)
        {
            var existing = _repo.GetById(id);
            if (existing == null) return false;

            _repo.Delete(id);
            return true;
        }
    }
}
