using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PartyUp.Models;

namespace PartyUp.Data;

public class PartyUpContext : IdentityDbContext<IdentityUser>
{
    public PartyUpContext(DbContextOptions<PartyUpContext> options) :
        base(options) { }

    public DbSet<UserModel> UsersProfile { get; set; } = null!;
    public DbSet<GroupModel> Groups { get; set; } = null!;
    public DbSet<GroupMember> GroupMembers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<UserModel>(entity =>
        {
            entity.HasKey(user => user.Id);

            entity.HasIndex(user => user.IdentityId)
                .IsUnique();

            entity.HasOne(user => user.IdentityUser)
                .WithOne()
                .HasForeignKey<UserModel>(user => user.IdentityId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(user => user.UserName)
                .IsRequired();

            entity.Property(user => user.Email)
                .IsRequired();
        });

        builder.Entity<GroupModel>(entity =>
        {
            entity.HasKey(group => group.Id);

            entity.HasOne(group => group.Owner)
                .WithMany()
                .HasForeignKey(group => group.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(member => new
            {
               member.UserId,
               member.GroupId 
            });

            entity.HasOne(member => member.User)
                .WithMany(user => user.GroupMemberships)
                .HasForeignKey(member => member.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(member => member.Group)
                .WithMany(group => group.Members)
                .HasForeignKey(member => member.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}