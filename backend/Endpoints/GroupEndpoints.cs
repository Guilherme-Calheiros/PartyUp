using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PartyUp.Constants;
using PartyUp.Contracts.Common;
using PartyUp.Contracts.Group;
using PartyUp.Models;
using PartyUp.Services;

namespace PartyUp.Endpoints;

public static class GroupEndpoints
{
    public static WebApplication MapGroupEndpoints(this WebApplication app)
    {
        var groups = app.MapGroup("/groups").WithTags("Groups").RequireAuthorization();
        var invites = app.MapGroup("/invites").WithTags("Invites").RequireAuthorization();

        groups.MapGet("options", () =>
        {
            return Results.Ok(new GroupOptionsResponse(
                GroupOptions.IconKeys,
                GroupOptions.ColorOptions
            ));
        });

        groups.MapGet("", async (
            ClaimsPrincipal user,
            PartyUpContext context,
            int page = 1,
            int pageSize = 10,
            GroupRole? role = null) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var memberships = context.GroupMembers
                .AsNoTracking()
                .Where(member => member.UserId == profile.Id);

            if (role is not null)
            {
                var roleValue = role.Value;

                memberships = memberships.Where(member =>
                    member.Role == roleValue
                );
            }

            var totalCount = await memberships.CountAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            );

            var items = await memberships
                .OrderByDescending(member => member.Group.CreatedAt)
                .ThenBy(member => member.Group.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(member => new GroupSummaryResponse(
                    member.Group.Id,
                    member.Group.Name,
                    member.Group.Description,
                    member.Group.IconKey,
                    member.Group.ColorKey,
                    member.Group.GroupPictureUrl,
                    member.Group.CreatedAt,
                    member.Group.Members.Count,
                    member.Role
                ))
                .ToListAsync();

            var response = new PagedResponse<GroupSummaryResponse>(
                items,
                page,
                pageSize,
                totalCount,
                totalPages
            );

            return Results.Ok(response);
        });

        groups.MapGet("{groupId}", async (
            ClaimsPrincipal user,
            PartyUpContext context,
            [FromRoute] string groupId) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var group = await context.GroupMembers
                .AsNoTracking()
                .Where(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                )
                .Select(member => new GroupResponse(
                    member.Group.Id,
                    member.Group.Name,
                    member.Group.Description,
                    member.Group.IconKey,
                    member.Group.ColorKey,
                    member.Group.GroupPictureUrl,
                    member.Group.CreatedAt,
                    member.Group.OwnerId,
                    member.Group.Owner.UserName,
                    member.Group.Members.Count,
                    member.Role
                ))
                .FirstOrDefaultAsync();

            if (group == null)
            {
                return Results.NotFound();
            }

            return Results.Ok(group);
        });

        groups.MapGet("{groupId}/members", async (
            ClaimsPrincipal user,
            PartyUpContext context,
            [FromRoute] string groupId) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var isMember = await context.GroupMembers
                .AnyAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                );

            if (!isMember)
            {
                return Results.NotFound();
            }

            var members = await context.GroupMembers
                .AsNoTracking()
                .Where(member => member.GroupId == groupId)
                .OrderBy(member => member.Role)
                .ThenBy(member => member.User.UserName)
                .Select(member => new GroupMemberResponse(
                    member.UserId,
                    member.User.UserName,
                    member.User.AvatarSeed,
                    member.User.ProfilePictureUrl,
                    member.Role
                ))
                .ToListAsync();

            return Results.Ok(members);
        });

        groups.MapPost("", async (
            [FromBody] CreateGroupRequest request,
            ClaimsPrincipal user,
            PartyUpContext context,
            InviteTokenService tokenService) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var errors = new Dictionary<string, string[]>();

            var name = request.Name?.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                errors["Name"] = ["O nome do grupo é obrigatório."];
            }
            else if (name.Length > 80)
            {
                errors["Name"] = ["O nome do grupo deve ter no máximo 80 caracteres."];
            }

            var description = request.Description?.Trim();

            if (description?.Length > 500)
            {
                errors["Description"] = ["A descrição deve ter no máximo 500 caracteres."];
            }

            var iconKey = request.IconKey?.Trim();

            if (string.IsNullOrEmpty(iconKey))
            {
                iconKey = GroupOptions.DefaultIconKey;
            }
            else if (!GroupOptions.IsValidIcon(iconKey))
            {
                errors["IconKey"] = ["Ícone de grupo inválido."];
            }

            var colorKey = request.ColorKey?.Trim();

            if (string.IsNullOrEmpty(colorKey))
            {
                colorKey = GroupOptions.DefaultColorKey;
            }
            else if (!GroupOptions.IsValidColor(colorKey))
            {
                errors["ColorKey"] = ["Cor de grupo inválida."];
            }

            string? pictureUrl = null;

            if (!string.IsNullOrWhiteSpace(request.GroupPictureUrl))
            {
                if (!UrlValidation.TryNormalizeHttpUrl(
                    request.GroupPictureUrl,
                    out var normalizedUrl
                ))
                {
                    errors["GroupPictureUrl"] = ["URL da foto do grupo inválida."];
                }
                else
                {
                    // TODO: fazer o save da url no S2 da cloudflare

                    pictureUrl = normalizedUrl;
                }
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            iconKey = iconKey.ToLowerInvariant();
            colorKey = colorKey.ToLowerInvariant();

            var group = new GroupModel
            {
                OwnerId = profile.Id,
                Name = name!,
                Description = string.IsNullOrWhiteSpace(description)
                    ? null
                    : description,
                IconKey = iconKey,
                ColorKey = colorKey,
                GroupPictureUrl = pictureUrl,
            };

            group.Members.Add(new GroupMember
            {
                UserId = profile.Id,
                Group = group,
                Role = GroupRole.Owner,
            });

            var token = tokenService.GenerateToken();

            var invite = new GroupInvite
            {
                Group = group,
                Token = token
            };

            group.Invite = invite;

            context.Groups.Add(group);
            await context.SaveChangesAsync();

            var response = new GroupResponse(
                group.Id,
                group.Name,
                group.Description,
                group.IconKey,
                group.ColorKey,
                group.GroupPictureUrl,
                group.CreatedAt,
                group.OwnerId,
                profile.UserName,
                group.Members.Count,
                GroupRole.Owner
            );

            return Results.Created($"/groups/{group.Id}", response);
        });

        groups.MapPatch("{groupId}", async (
            [FromBody] UpdateGroupRequest request,
            [FromRoute] string groupId,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var errors = new Dictionary<string, string[]>();

            var membership = await context.GroupMembers
                .Where(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                )
                .Select(member => new
                {
                    member.Role,
                    member.Group
                })
                .FirstOrDefaultAsync();

            if (membership is null)
            {
                return Results.NotFound();
            }

            if (membership.Role != GroupRole.Admin &&
                membership.Role != GroupRole.Owner)
            {
                return Results.Forbid();
            }

            var group = membership.Group;

            var name = group.Name;
            var description = group.Description;
            var iconKey = group.IconKey;
            var colorKey = group.ColorKey;
            var pictureUrl = group.GroupPictureUrl;

            if (request.Name is not null)
            {
                var newName = request.Name.Trim();

                if (string.IsNullOrWhiteSpace(newName))
                {
                    errors["Name"] = ["O nome do grupo é obrigatório."];
                }
                else if (newName.Length > 80)
                {
                    errors["Name"] = ["O nome do grupo deve ter no máximo 80 caracteres."];
                }
                else
                {
                    name = newName;
                }
            }

            if (request.Description is not null)
            {
                var newDescription = request.Description.Trim();

                if (newDescription.Length > 500)
                {
                    errors["Description"] = ["A descrição deve ter no máximo 500 caracteres."];
                }
                else
                {
                    description = string.IsNullOrWhiteSpace(newDescription)
                        ? null
                        : newDescription;
                }
            }

            if (request.IconKey is not null)
            {
                var newIconKey = request.IconKey.Trim();

                if (string.IsNullOrEmpty(newIconKey))
                {
                    newIconKey = GroupOptions.DefaultIconKey;
                }
                else if (!GroupOptions.IsValidIcon(newIconKey))
                {
                    errors["IconKey"] = ["Ícone de grupo inválido."];
                }

                if (GroupOptions.IsValidIcon(newIconKey))
                {
                    iconKey = newIconKey.ToLowerInvariant();
                }
            }

            if (request.ColorKey is not null)
            {
                var newColorKey = request.ColorKey.Trim();

                if (string.IsNullOrEmpty(newColorKey))
                {
                    newColorKey = GroupOptions.DefaultColorKey;
                }
                else if (!GroupOptions.IsValidColor(newColorKey))
                {
                    errors["ColorKey"] = ["Cor de grupo inválida."];
                }

                if (GroupOptions.IsValidColor(newColorKey))
                {
                    colorKey = newColorKey.ToLowerInvariant();
                }
            }

            if (request.GroupPictureUrl.ValueKind != JsonValueKind.Undefined)
            {
                if (request.GroupPictureUrl.ValueKind == JsonValueKind.Null)
                {
                    pictureUrl = null;
                }
                else if (request.GroupPictureUrl.ValueKind == JsonValueKind.String)
                {
                    var newPictureUrl = request.GroupPictureUrl.GetString();

                    if (string.IsNullOrWhiteSpace(newPictureUrl) ||
                        !UrlValidation.TryNormalizeHttpUrl(
                            newPictureUrl,
                            out var normalizedUrl
                        ))
                    {
                        errors["GroupPictureUrl"] = ["URL da foto do grupo inválida."];
                    }
                    else
                    {
                        // TODO: fazer o save da imagem no Cloudflare R2.
                        pictureUrl = normalizedUrl;
                    }
                }
                else
                {
                    errors["GroupPictureUrl"] = ["O campo deve conter uma URL ou null."];
                }
            }

            if (errors.Count > 0)
            {
                return Results.ValidationProblem(errors);
            }

            group.Name = name;
            group.Description = description;
            group.IconKey = iconKey;
            group.ColorKey = colorKey;
            group.GroupPictureUrl = pictureUrl;

            await context.SaveChangesAsync();

            var response = new UpdateGroupResponse(
                group.Id,
                group.Name,
                group.Description,
                group.IconKey,
                group.ColorKey,
                group.GroupPictureUrl
            );

            return Results.Ok(response);
        });

        groups.MapPatch("{groupId}/transfer-ownership", async (
            [FromBody] TransferOwnershipRequest request,
            [FromRoute] string groupId,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var membership = await context.GroupMembers
                .Include(member => member.Group)
                .FirstOrDefaultAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                );

            if (membership is null)
            {
                return Results.NotFound();
            }

            if (membership.Role != GroupRole.Owner)
            {
                return Results.Forbid();
            }

            if (request.NewOwnerId == profile.Id)
            {
                return Results.BadRequest("Você já é o proprietário deste grupo.");
            }

            var newOwnerMembership = await context.GroupMembers
                .FirstOrDefaultAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == request.NewOwnerId
                );

            if (newOwnerMembership is null)
            {
                return Results.NotFound();
            }

            membership.Group.OwnerId = request.NewOwnerId;
            membership.Role = GroupRole.Member;
            newOwnerMembership.Role = GroupRole.Owner;

            await context.SaveChangesAsync();

            return Results.NoContent();
        });

        groups.MapPatch("{groupId}/members/{userId}/role", async (
            [FromRoute] string groupId,
            [FromRoute] string userId,
            [FromBody] UpdateGroupMemberRoleRequest request,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var membership = await context.GroupMembers
                .FirstOrDefaultAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                );

            if (membership is null)
            {
                return Results.NotFound();
            }

            if (request.NewRole != GroupRole.Admin &&
                request.NewRole != GroupRole.Member)
            {
                return Results.BadRequest("Cargo inválido.");
            }

            if (userId == profile.Id)
            {
                return Results.BadRequest("Você não pode alterar seu próprio cargo.");
            }

            var targetMembership = await context.GroupMembers
                .Where(member =>
                    member.GroupId == groupId &&
                    member.UserId == userId
                )
                .FirstOrDefaultAsync();

            if (targetMembership is null)
            {
                return Results.NotFound();
            }

            if (request.NewRole == GroupRole.Owner)
            {
                return Results.BadRequest("Use a transferência de propriedade para alterar o Owner.");
            }

            targetMembership.Role = request.NewRole;

            await context.SaveChangesAsync();

            return Results.NoContent();
        });

        groups.MapPost("{groupId}/members/{userId}/kick", async (
            [FromRoute] string groupId,
            [FromRoute] string userId,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var membership = await context.GroupMembers
                .FirstOrDefaultAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                );

            if (membership is null)
            {
                return Results.NotFound();
            }

            var targetMembership = await context.GroupMembers
                .FirstOrDefaultAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == userId
                );

            if (targetMembership is null)
            {
                return Results.NotFound();
            }

            if (targetMembership.Role == GroupRole.Owner)
            {
                return Results.BadRequest("O proprietário não pode ser expulso.");
            }

            var canKick =
                membership.Role == GroupRole.Owner ||
                (membership.Role == GroupRole.Admin &&
                targetMembership.Role == GroupRole.Member);

            if (!canKick)
            {
                return Results.Forbid();
            }

            context.GroupMembers.Remove(targetMembership);
            await context.SaveChangesAsync();

            return Results.NoContent();
        });

        invites.MapGet("{token}", async (
            [FromRoute] string token,
            PartyUpContext context) =>
        {
            var invite = await context.GroupInvites
                .AsNoTracking()
                .Where(invite => invite.Token == token)
                .Select(invite => new GroupInviteResponse(
                    invite.Group.Id,
                    invite.Group.Name,
                    invite.Group.Description,
                    invite.Group.IconKey,
                    invite.Group.ColorKey,
                    invite.Group.GroupPictureUrl,
                    invite.Group.CreatedAt,
                    invite.Group.OwnerId,
                    invite.Group.Owner.UserName,
                    invite.Group.Members.Count
                ))
                .FirstOrDefaultAsync();

            if (invite is null)
            {
                return Results.NotFound();
            }

            return Results.Ok(invite);
        });

        invites.MapPost("{token}/join", async (
            [FromRoute] string token,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var invite = await context.GroupInvites
                .Where(invite => invite.Token == token)
                .Select(invite => new
                {
                    invite.GroupId
                })
                .FirstOrDefaultAsync();

            if (invite is null)
            {
                return Results.NotFound();
            }

            var isAlreadyMember = await context.GroupMembers
                .AnyAsync(member =>
                    member.GroupId == invite.GroupId &&
                    member.UserId == profile.Id
                );

            if (!isAlreadyMember)
            {
                var membership = new GroupMember
                {
                    UserId = profile.Id,
                    GroupId = invite.GroupId,
                    Role = GroupRole.Member,
                    JoinedAt = DateTime.UtcNow
                };

                context.GroupMembers.Add(membership);
                await context.SaveChangesAsync();
            }

            return Results.Ok(new { groupId = invite.GroupId });
        });

        groups.MapGet("{groupId}/invite", async (
            [FromRoute] string groupId,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var membership = await context.GroupMembers
                .Where(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                )
                .Select(member => new
                {
                    member.Group.Invite
                })
                .FirstOrDefaultAsync();

            if (membership is null || membership.Invite is null)
            {
                return Results.NotFound();
            }

            return Results.Ok(new { token = membership.Invite.Token });
        });

        groups.MapPost("{groupId}/invite/regenerate", async (
            [FromRoute] string groupId,
            ClaimsPrincipal user,
            PartyUpContext context,
            InviteTokenService tokenService) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var membership = await context.GroupMembers
                .Where(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                )
                .Select(member => new
                {
                    member.Role,
                    member.Group.Invite
                })
                .FirstOrDefaultAsync();

            if (membership is null || membership.Invite is null)
            {
                return Results.NotFound();
            }

            if (membership.Role != GroupRole.Admin &&
                membership.Role != GroupRole.Owner)
            {
                return Results.Forbid();
            }

            membership.Invite.Token = tokenService.GenerateToken();
            membership.Invite.CreatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Results.NoContent();
        });

        groups.MapPost("{groupId}/leave", async (
            [FromRoute] string groupId,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            await using var transaction = await context.Database.BeginTransactionAsync();

            var membership = await context.GroupMembers
                .Include(member => member.Group)
                .FirstOrDefaultAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                );

            if (membership is null)
            {
                return Results.NotFound();
            }

            var hasOtherMembers = await context.GroupMembers
                .AnyAsync(member =>
                    member.GroupId == groupId &&
                    member.UserId != profile.Id
                );

            if (membership.Role == GroupRole.Owner && hasOtherMembers)
            {
                return Results.Conflict(new
                {
                    message = "Transfira a propriedade do grupo antes de sair."
                });
            }

            if (!hasOtherMembers)
            {
                context.Groups.Remove(membership.Group);
            }
            else
            {
                context.GroupMembers.Remove(membership);
            }

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Results.NoContent();
        });

        groups.MapDelete("{groupId}", async (
            [FromRoute] string groupId,
            ClaimsPrincipal user,
            PartyUpContext context) =>
        {
            var (profile, _) = await user.GetProfileAsync(context);

            if (profile is null)
            {
                return Results.NotFound();
            }

            var membership = await context.GroupMembers
                .Where(member =>
                    member.GroupId == groupId &&
                    member.UserId == profile.Id
                )
                .Select(member => new
                {
                    member.Role,
                    member.Group
                })
                .FirstOrDefaultAsync();

            if (membership is null)
            {
                return Results.NotFound();
            }

            if (membership.Role != GroupRole.Owner)
            {
                return Results.Forbid();
            }

            context.Groups.Remove(membership.Group);
            await context.SaveChangesAsync();

            return Results.NoContent();
        });

        return app;
    }
}
