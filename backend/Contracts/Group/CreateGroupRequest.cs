using System.ComponentModel.DataAnnotations;
using PartyUp.Constants;
using PartyUp.Models;

namespace PartyUp.Contracts.Group;

public class CreateGroupRequest
{
    [Required]
    [StringLength(80)]
    public string Name { get; set; } = string.Empty;
    [StringLength(500)]
    public string? Description { get; set; }
    public string IconKey { get; set; } = GroupOptions.DefaultIconKey;
    public string ColorKey { get; set; } = GroupOptions.DefaultColorKey;
    public string? GroupPictureUrl { get; set; }
}
