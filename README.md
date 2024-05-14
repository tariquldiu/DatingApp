# DatingApp
CLI
------------------
mkdir DatingApp : Create folder
dotnet new sln  : Create new solution
dotnet new webapi -n API --use-controllers : Create API project
dotnet sln add API : Add API.csproj file into API folder
dotnet run : Run the project
dotnet watch : Hot reload the project 


Extentions
-------------------
C# Dev Kit
C#
.NET Install Tool
IntelliCode for C# Dev Kit
C# Extensions
NuGet Gallery
SQLite
SQLite Viewer
Angular Language Service
Material Icon Theme

NuGet 
-------------------
Microsoft.EntityFrameworkCore.Design
Microsoft.EntityFrameworkCore.Sqlite
Microsoft.Data.Sqlite

Install Others
-------------------
dotnet tool install --global dotnet-ef --version 8.*

Migration
-------------------
dotnet ef migrations add InitialCreate -o Data/Migrations
dotnet ef database update

Add to git
-------------------
Write on the bash terminal
git init   --initialization to add the project to git
dotnet new gitignore
dotnet new globaljson
create new repo from web


