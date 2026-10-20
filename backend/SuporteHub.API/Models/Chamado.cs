namespace SuporteHub.API.Models;

public class Chamado
{
    public int Id { get; set; }

    public string Titulo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public string Prioridade { get; set; } = string.Empty;

    public string Status { get; set; } = "Aberto";

    public string Usuario { get; set; } = string.Empty;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}