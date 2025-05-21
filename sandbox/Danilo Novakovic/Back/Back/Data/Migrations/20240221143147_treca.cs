using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Back.Data.Migrations
{
    /// <inheritdoc />
    public partial class treca : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Korisnik",
                table: "Korisnik");

            migrationBuilder.RenameTable(
                name: "Korisnik",
                newName: "Korisnici");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Korisnici",
                table: "Korisnici",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Korisnici",
                table: "Korisnici");

            migrationBuilder.RenameTable(
                name: "Korisnici",
                newName: "Korisnik");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Korisnik",
                table: "Korisnik",
                column: "Id");
        }
    }
}
