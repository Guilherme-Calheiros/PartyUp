using System.Collections.Frozen;
using PartyUp.Contracts.Group;

namespace PartyUp.Constants;

public static class GroupOptions
{
    public const string DefaultIconKey = "gamepad-2";
    public const string DefaultColorKey = "indigo";

    public static readonly IReadOnlyList<string> IconKeys = new[]
    {
        "gamepad-2",
        "swords",
        "crown",
        "ghost",
        "shield",
        "rocket",
        "trophy",
        "skull",
    };

    public static readonly IReadOnlyList<GroupColorOption> ColorOptions = new[]
    {
        new GroupColorOption("indigo", "Índigo", "#6366F1"),
        new GroupColorOption("blue", "Azul", "#3B82F6"),
        new GroupColorOption("cyan", "Ciano", "#0891B2"),
        new GroupColorOption("green", "Verde", "#16A34A"),
        new GroupColorOption("emerald", "Esmeralda", "#0D9488"),
        new GroupColorOption("orange", "Laranja", "#EA8A24"),
        new GroupColorOption("red", "Vermelho", "#DC5252"),
        new GroupColorOption("purple", "Roxo", "#9333EA"),
    };

    public static readonly FrozenSet<string> Icons = IconKeys
        .ToFrozenSet(StringComparer.OrdinalIgnoreCase);

    public static readonly FrozenSet<string> Colors = ColorOptions
        .Select(color => color.Key)
        .ToFrozenSet(StringComparer.OrdinalIgnoreCase);

    public static bool IsValidIcon(string? key) =>
        !string.IsNullOrWhiteSpace(key) && Icons.Contains(key);

    public static bool IsValidColor(string? key) =>
        !string.IsNullOrWhiteSpace(key) && Colors.Contains(key);
}
