using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Back.Data.Migrations
{
    /// <inheritdoc />
    public partial class druga : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Korisniks",
                table: "Korisniks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Filmovis",
                table: "Filmovis");

            migrationBuilder.RenameTable(
                name: "Korisniks",
                newName: "Korisnik");

            migrationBuilder.RenameTable(
                name: "Filmovis",
                newName: "Filmovi");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Korisnik",
                table: "Korisnik",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Filmovi",
                table: "Filmovi",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Korisnik",
                table: "Korisnik");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Filmovi",
                table: "Filmovi");

            migrationBuilder.RenameTable(
                name: "Korisnik",
                newName: "Korisniks");

            migrationBuilder.RenameTable(
                name: "Filmovi",
                newName: "Filmovis");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Korisniks",
                table: "Korisniks",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Filmovis",
                table: "Filmovis",
                column: "Id");
        }
    }
}
