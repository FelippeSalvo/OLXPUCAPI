using System.Text.Json;
using OLXPUCAPI.Models;

namespace OLXPUCAPI.Repositories
{
    public class JsonRepository<T> where T : class, IEntity
    {
        private readonly string _filePath;
        private readonly object _lock = new();

        public JsonRepository(string filePath)
        {
            _filePath = filePath;

            // Garante que o arquivo existe
            if (!File.Exists(_filePath))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
                File.WriteAllText(_filePath, "[]");
            }
        }

        // 🔹 Lê todos os registros
        public List<T> GetAll()
        {
            lock (_lock)
            {
                var json = File.ReadAllText(_filePath);
                var list = JsonSerializer.Deserialize<List<T>>(json);
                return list ?? new List<T>();
            }
        }

        // 🔹 Salva a lista completa no arquivo
        private void SaveAll(List<T> items)
        {
            lock (_lock)
            {
                var options = new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = null, // Mantém PascalCase
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never // Inclui propriedades null
                };
                var json = JsonSerializer.Serialize(items, options);
                File.WriteAllText(_filePath, json);
            }
        }

        // 🔹 Retorna um item por ID
        public T? GetById(Guid id)
        {
            return GetAll().FirstOrDefault(x => x.Id == id);
        }

        // 🔹 Adiciona um novo registro
        public void Add(T item)
        {
            var items = GetAll();
            items.Add(item);
            SaveAll(items);
        }

        // 🔹 Atualiza um registro existente
        public void Update(T item)
        {
            var items = GetAll();
            var index = items.FindIndex(x => x.Id == item.Id);
            if (index != -1)
            {
                // Substitui completamente o item para garantir que todos os campos sejam atualizados
                items[index] = item;
                SaveAll(items);
                
                // Verifica se foi salvo corretamente (debug)
                var verificacao = GetById(item.Id);
                if (verificacao != null)
                {
                    System.Diagnostics.Debug.WriteLine($"JsonRepository.Update: Item {item.Id} atualizado e verificado");
                }
            }
        }

        // 🔹 Remove um registro
        public void Delete(Guid id)
        {
            var items = GetAll();
            var item = items.FirstOrDefault(x => x.Id == id);
            if (item != null)
            {
                items.Remove(item);
                SaveAll(items);
            }
        }
    }
}
