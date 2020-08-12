# go-fs-server
Simple one binary filesystem server in GO and JS.

## Features

- List directories
- Create new files and directories
- Remove files and directories
- Cut/Paste files and directories
- Edit files
- Rename files and directories
- Download files
- Upload multiple files
- Manage users of application
- Manage users privilege (WIP, actually there are just administrators and others)
- Embedded in-binary website
- Automatic database creation
- Only one portable binary (associated with one or more databases)

## Build

To build the binary, you just need to type the command `go build` at the root of the project.

There is a case for which you'll need to run a script : if you've modified the website interface source code (anything in the `assets` directory). You'll need to run the Scripts/assets.go, by building it and then running it (Windows binary is already built).

## Usage

```bash
./fs-server <directory path> <database directory path> [port]
```

`directory path` is the path of the directory you want to work in.

`database directory path` is the path of the directory that contains the `fs-server.db` file. This embedded database contains users and sessions.

`port` is the port on which the HTTP server will be listening on (default 8008).



An HTTP server will be started, listening on `127.0.0.1:port`. Using `nginx` or any other reverse proxy, you can make it accessible from outside.

You can then go to https://yourdomain/location_of_proxy/ to access the GUI. Your default user/password will be admin/admin. It is highly recommended to change it on first login.

## Permissions

The API is designed to not permit access of parent directory of `directory path`, forbidding usage of `.` and `..` in requested `path`.

But to avoid any unexpected behaviors from your users, you can manage permissions of folders, and not run the app as root.

## Works on top of :

- [mini.css](https://github.com/Chalarangelo/mini.css) from [Chalarangelo](https://github.com/Chalarangelo)

- [CustomElement-DropFiles](https://github.com/Grafikart/CustomElement-DropFiles) from [Grafikart](https://github.com/Grafikart)

- [httprouter](https://github.com/julienschmidt/httprouter) from [julienschmidt](https://github.com/julienschmidt)

- [vfsgen](https://github.com/shurcooL/vfsgen) from [shurcooL](https://github.com/shurcooL)

- [go-sqlite3](https://github.com/mattn/go-sqlite3)  from [mattn](https://github.com/mattn)
