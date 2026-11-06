using PartyUp.Models;

namespace PartyUp.Contracts.Group;

public record UpdateGroupMemberRoleRequest(
    GroupRole NewRole
);