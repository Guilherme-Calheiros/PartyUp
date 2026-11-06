namespace PartyUp.Contracts.Group;

public record GroupOptionsResponse(
    IReadOnlyList<string> Icons,
    IReadOnlyList<GroupColorOption> Colors
);
