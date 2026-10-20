using Microsoft.AspNetCore.Mvc;
using SuporteHub.API.DTOs;
using SuporteHub.API.Models;

namespace SuporteHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChamadosController : ControllerBase
{
    private static readonly List<Chamado> Chamados = new();

    [HttpGet]
    public IActionResult ListarChamados()
    {
        return Ok(Chamados);
    }

    [HttpGet("{id}")]
    public IActionResult BuscarChamado(int id)
    {
        var chamado = Chamados.FirstOrDefault(c => c.Id == id);

        if (chamado == null)
        {
            return NotFound(new
            {
                mensagem = "Chamado não encontrado."
            });
        }

        return Ok(chamado);
    }

    [HttpPost]
    public IActionResult CriarChamado(CriarChamadoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Titulo))
        {
            return BadRequest(new
            {
                mensagem = "O título do chamado é obrigatório."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.Descricao))
        {
            return BadRequest(new
            {
                mensagem = "A descrição do chamado é obrigatória."
            });
        }

        var chamado = new Chamado
        {
            Id = Chamados.Count + 1,
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            Categoria = dto.Categoria,
            Prioridade = dto.Prioridade,
            Usuario = dto.Usuario,
            Status = "Aberto",
            DataCriacao = DateTime.UtcNow
        };

        Chamados.Add(chamado);

        return CreatedAtAction(
            nameof(BuscarChamado),
            new { id = chamado.Id },
            chamado
        );
    }
}